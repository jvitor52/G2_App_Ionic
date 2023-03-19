app.controller('ComponentsCtrl', function($scope, $stateParams, ionicMaterialInk, DatabaseValues, $state, $filter, $cordovaNetwork,$ionicPopup,$ionicLoading,banco,$cordovaGeolocation) {

    $scope.usuarioNome = '';
    $scope.usuario = '';

    var watchOptions = {
        timeout: 5000,
        maximumAge: 3000,
        enableHighAccuracy: true, // may cause errors if true
    };

    var _inicioLoad = function () {
        $ionicLoading.show({
            template:
            '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>',
        });
    };

    var _fimLoad = function () {
        $ionicLoading.hide();
    };
    console.log('estuo aquiiiii');
    var _init = async function (talhao,fazenda) {
        _inicioLoad();
        var logado = await _checkLogin(talhao,fazenda);
        console.log(logado);

       /*  var sql = `SELECT * FROM plots`;
    
        var params = [];
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);

        if(lista.length == 0){
            banco.executa(
            `insert into plots (atividade, bloco, fazenda,up,talhao,parcela , area_talhao, especie, material, espacamento , plantio , refime, lado1 , lado2 , area_parcela , tipo , ciclo , rotacao , situacao , medir , status , data_realizacao , observacao , zona_utm , log_x, lat_y ,alt_z )
            values('IFC','IFC- TUR','VJQ - Campo Limpo IV','VJQ - Campo Limpo IV','VJ092','3','2000','','','','','','12,62','','500','I','','','','SIM','','','','23k','720897','8104089',''),
            ('IFC','IFC- TUR','VJQ - Campo Limpo IV','VJQ - Campo Limpo IV','VJ093','2','1850','','','','','','12,62','','400','I','','','','SIM','','','','23k','721499','8103968','');`
            );
        }else{
            console.log('encontrou registros');
        } */

        $cordovaGeolocation.getCurrentPosition(watchOptions).then(
            function (position) {

            }
        );

        _fimLoad();
        if(logado){
            $state.go('app.inicio');
        }
    };

    var _checkLogin = async function (talhao,fazenda) {   
        var sql = `SELECT * FROM usuario`;
    
        var params = [];
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? true : false;
        return retult;
    };

    var _getToken = async function (talhao,fazenda) {   
        var sql = `SELECT * FROM config`;
    
        var params = [];
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? lista[0].token : '';
        return retult;
    };


    _init();

    

    $scope.getUsuario = function() {
        $scope.os = [];
        DatabaseValues.setup();
        DatabaseValues.bancoDeDados.transaction(function(transacao) {
            var log = [];
            var sql = "SELECT * from usuario ";
            var params = [];
            transacao.executeSql(sql, params, function(tx, result) {
                for (var i = 0; i < result.rows.length; i++) {

                    var row = result.rows.item(i);

                    $scope.usuarioNome = row.nome;
                    $scope.$apply();
                }
            }, function(tx, error) {
                //console.log('deu errado');
                console.log(error.message);
            });
        });
    }

    $scope.getUsuario();

    

    $scope.mat = 0;
    $scope.ip = '';
   

    function onOnline() {
        // Handle the online event
        var networkState = navigator.connection.type;

        if (networkState !== Connection.NONE) {
            return true;
        } else {
            return false;
        }
    }

   
    $scope.matricula = '';


    $scope.logoff = function() {
        DatabaseValues.setup();
        DatabaseValues.bancoDeDados.transaction(function(transacao) {

            var sql = "delete from usuario";
            var params = [];

            transacao.executeSql(sql, params, function() {
                $scope.gif = false;
                $scope.mat = 0;
                $scope.$apply();
                $state.go('app.components');
            }, function(transacao, erro) {
                console.log(erro.message);
            });



        });
    }
    $scope.showAlert = function (titulo, msg) {
        var alertPopup = $ionicPopup.alert({
          title: titulo,
          template: msg,
        });
  
        alertPopup.then(function (res) {
          console.log("Thank you for not eating my delicious ice cream cone");
        });
    };

    var _getPlotsLancamentos = async function () {   
        var sql = `SELECT lc.*, us.nome as reponsavelNome FROM plots_lancamento lc 
                   inner join usuario us on us.id = lc.responsavel  
                   where lc.status = 'true' and lc.sync = 0`;
    
        var params = [];
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? lista : null;
        return Array.from(resultado.rows);
    };

    var _getPlotsLancamentosAlt = async function () {   
        var sql = `SELECT lc.*, us.nome as reponsavelNome FROM plots_lancamento lc 
                   inner join usuario us on us.id = lc.responsavel  
                   where lc.status = 'true'`;
    
        var params = [];
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? lista : null;
        return retult;
    };

    var _getPlotsLancamentosArv = async function (id) {   
        if(id){
            var sql = `SELECT arv.* FROM plots_lancamento_arv arv
                       where arv.sync = 0 and arv.plots_lancamento_id = ?`;
        
            var params = [id];
        }else{
            var sql = `SELECT arv.* FROM plots_lancamento_arv arv
                       where arv.sync = 0 `;
        
            var params = [];
        }
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? lista : null;
        return retult;
    };

    $scope.subirArv = async function(id,idBack){
        var plotsLancArv = await _getPlotsLancamentosArv(id);
        let erroArv = false;
        for (let i = 0; i < plotsLancArv.length; i++) {
            var arv = plotsLancArv[i];
            try {
                $.ajax({
                    url: 'https://apig2-g2forest.vercel.app/api/arv/create',
                    type: "POST",
                    timeout: 30 * 1000,
                    dataType: 'json',
                    data: {
                        plots_lancamento_id: idBack,
                        linha: arv.linha,
                        fim_linha: arv.fim_linha,
                        numeros: arv.numero,
                        matriz: arv.matrix,
                        arvore: arv.arvore,
                        dap: arv.dap,
                        altura: arv.altura,
                        dap2: arv.dap2,
                        alt_poda: arv.alt_poda,
                        dominante: arv.dominante,
                    },
                    success: async function(data) {   
                        console.log("arv.id == ", arv.id)                                                                                                                                
                    },
                    error: function(err) {
                        _fimLoad();
                        
                        erroArv = true;                   
                    }
                }); 
            } catch (error) {
                return '';
            }
            
        }
        return erroArv;
    }
    
    var _getPlots = async function (id) {   
        
        var sql = `SELECT * FROM plots_lancamento where sync = 0`;
    
        var params = [];
        
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? lista : null;
        return retult;
    };

    var _getPlotsAlt = async function (id) {   
        
        var sql = `SELECT * FROM plots_lancamento`;
    
        var params = [];
        
        var resultado = await banco.executa(sql, params);
        var lista = Array.from(resultado.rows);
        var retult = lista.length > 0 ? lista : null;
        return retult;
    };

    function createFile() {
        var type = window.TEMPORARY;
        var size = 5*1024*1024;
        window.requestFileSystem(type, size, successCallback, errorCallback)
     
        function successCallback(fs) {
           fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {
              //alert('File creation successfull!')
           }, errorCallback);
        }
     
        function errorCallback(error) {
           console.log("ERROR: " + error.code)
        }
       
    }

    function writeFile(texto) {
        var type = window.TEMPORARY;
        var size = 5*1024*1024;
        window.requestFileSystem(type, size, successCallback, errorCallback)
      
        function successCallback(fs) {
           fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
      
              fileEntry.createWriter(function(fileWriter) {
                 fileWriter.onwriteend = function(e) {
                    //alert('Write completed.');
                 };
      
                 fileWriter.onerror = function(e) {
                    alert('Write failed: ' + e.toString());
                 };
      
                 var blob = new Blob([texto], {type: 'text/plain'});
                 fileWriter.write(blob);
              }, errorCallback);
           }, errorCallback);
        }
      
        function errorCallback(error) {
           alert("ERROR: " + error.code)
        }
    }

    $scope.dados = [];

    $scope.prepararDados = async function(){               
        var plotsLanc = await _getPlotsLancamentos();
        var PlotsArv = await _getPlotsLancamentosArv();
        var finalizou = false;

        var dados = [];
        var cont = 0;
        var realizarUpload = false;
        for (let i = 0; i < plotsLanc.length; i++) {
            cont++;
            var lanc = plotsLanc[i];
            var arrayArv = [];
            var dataLanc = new Date(lanc.data_realizacao);                    
            var dataForm = (dataLanc.getDate() < 10 ? '0'+dataLanc.getDate() : dataLanc.getDate()) +'/'+(dataLanc.getMonth()+1 < 10 ? '0'+(dataLanc.getMonth()+1) :dataLanc.getMonth()) +'/'+dataLanc.getFullYear()+' '+(dataLanc.getHours() < 10 ? '0'+dataLanc.getHours() : dataLanc.getHours())+':'+(dataLanc.getMinutes() < 10 ? '0'+dataLanc.getMinutes() :dataLanc.getMinutes())+':'+dataLanc.getSeconds();
            
            var horaI = new Date(lanc.hora_inicio);
            var horaIForm = horaI.getHours()+':'+(horaI.getMinutes() < 10 ? '0'+horaI.getMinutes() : horaI.getMinutes())+':'+(horaI.getSeconds() < 10 ? '0'+horaI.getSeconds() : horaI.getSeconds());
            var horaF = new Date(lanc.hora_fim);

            lanc.data_realizacao = dataForm;
            lanc.hora_inicio = horaIForm;
            lanc.hora_fim = horaFForm;
            var horaFForm = horaF.getHours()+':'+(horaF.getMinutes() < 10 ? '0'+horaF.getMinutes() : horaF.getMinutes())+':'+(horaF.getSeconds() < 10 ? '0'+horaF.getSeconds() : horaF.getSeconds());
            var contArv = 0;
            for (let i = 0; i < PlotsArv.length; i++) {
                var arv = PlotsArv[i];
                if(lanc.id == arv.plots_lancamento_id){
                    contArv++;
                    arrayArv.push(arv);
                }
            }
            lanc.arvores = arrayArv;
            dados.push(lanc);
            if(cont == plotsLanc.length - 1){
                $scope.dados = dados;
                finalizou = true;
            }
        }
        if(finalizou){
            return dados;
        }   
    }

    $scope.subirDados = async function(){
        try {
            if (onOnline()) {
                _inicioLoad();
                var input = {};
                var data = new Object();
                dados = await $scope.prepararDados();
                data.arv = await _getPlotsLancamentosArv();

                if(data){
                    await $.ajax({
                        url: 'https://apig2-g2forest.vercel.app/api/lancamento/createAdv',
                        //url: 'http://localhost:3000/api/lancamento/createAdv',
                        type: "POST",
                        dataType: "text",
                        data: {data : JSON.stringify(dados)},
                        success: async function(data) {   
                            await banco.executa('UPDATE plots_lancamento SET sync = 1 WHERE sync = 0');                            
                            await banco.executa('UPDATE plots_lancamento_arv SET sync = 1 WHERE sync = 0');                                                                    
                            _fimLoad();
                            $scope.showAlert('Oba', '<p>Todos os registros foram enviados para o servidor!</p>');
                        },
                        error: function(err) {
                            _fimLoad();
                            $scope.showAlert('Atenção', '<p>Entre em contato com o Desenvolvedor</p>');   
                        }
                    });  
                    
                    

                } 
                
            }else{
                _fimLoad();
                $scope.showAlert('Atenção', '<p>Verifique sua conexão com a Internet</p>');    
            } 
            
        } catch (error) {
            console.log(error);
            _fimLoad();
            $scope.showAlert('Atenção', '<p>Verifique sua conexão com a Internet</p>');
        }
    }


    $scope.baixarDados = async function(){
        try {
            if (onOnline()) {  
                var token = await _getToken();
                
                _inicioLoad();
                $.ajax({
                    url: 'https://apig2-g2forest.vercel.app/api/plots/list',
                    type: "GET",
                    dataType: 'json',
                    success: async function(data) {
                        console.log('data == ',data);
                        
                        var sqlDel = 'DELETE from plots';
                        await banco.executa(sqlDel);

                        var sql = 'insert into plots (atividade, bloco, fazenda,up,talhao,parcela , area_talhao, especie, material, espacamento , plantio , refime, lado1 , lado2 , area_parcela , tipo , ciclo , rotacao , situacao , medir , status , data_realizacao , observacao , zona_utm , log_x, lat_y ,alt_z ) VALUES';                       
                        for (let i = 0; i < data.length; i++) {
                            var plotInc = data[i];
                            sql += ` ('${plotInc.atividade}', '${plotInc.bloco}', '${plotInc.fazenda}', '${plotInc.up}', '${plotInc.talhao}', '${plotInc.parcela}', '${plotInc.area_talhao}','${plotInc.especie}','${plotInc.material}','${plotInc.espacamento}','${plotInc.plantio}','${plotInc.refime}','${plotInc.lado1}','${plotInc.lado2}','${plotInc.area_parcela}','${plotInc.tipo}','${plotInc.ciclo}','${plotInc.rotacao}','${plotInc.situacao}','${plotInc.medir}','${plotInc.status}','${plotInc.data_realizacao}','${plotInc.observacao}','${plotInc.zona_utm}','${plotInc.log_x}','${plotInc.lat_y}','${plotInc.alt_z}'),`;
                        }
                        sql = sql.slice(0, -1) + ';';

                        await banco.executa(sql);
                        _fimLoad();
                    },
                    error: function(err) {
                        _fimLoad();
                        $scope.showAlert('Atenção', '<p>Entre em contato com o suporte</p>');                        
                    }
                });
                
                
            }else{
                $scope.showAlert('Atenção', '<p>Verifique sua conexão com a Internet</p>');
            }
            
        } catch (error) {
            console.log(error);
            $scope.showAlert('Atenção', '<p>Verifique sua conexão com a Internet 222</p>');
        }
    }

    $scope.salvar = function() {
        if ($scope.usuario != '' && $scope.senha != '') {
            if (onOnline()) {                        
                $scope.sincroniaMSG = '';
                _inicioLoad();  
                $.ajax({
                    url: 'https://apig2-g2forest.vercel.app/api/auth/login',
                    type: "POST",
                    timeout: 30 * 1000,
                    dataType: 'json',
                    data: {
                        nome: $scope.usuario,
                        senha: $scope.senha
                    },
                    success: function(data) {
                        console.log('data == ',data);
                        _fimLoad();
                        $scope.$apply();
                        DatabaseValues.setup();
                        DatabaseValues.bancoDeDados.transaction(function(transacao) {
                            var sql = 'INSERT INTO usuario (nome, senha) VALUES(?,?);';
                            params = [$scope.usuario, $scope.senha];

                            transacao.executeSql(sql, params, function() {

                            }, function(transacao, erro) {
                                alert(erro.message);
                            });

                            var sql = 'INSERT INTO config (token) VALUES(?);';
                            params = [data.token];

                            transacao.executeSql(sql, params, function() {

                            }, function(transacao, erro) {
                                alert(erro.message);
                            });

                            
                            $state.go('app.inicio');
                        });                            

                    },
                    error: function(err) {
                        _fimLoad();
                        $scope.showAlert('Atenção', '<p>Usuário ou senha incorreto(s)</p>');                        
                    }
                });  
                                           
            } else {
                _fimLoad();
                $scope.showAlert('Atenção', '<p>Verifique sua conexão com a Internet</p>');

            }
                    

        }else{
            _fimLoad();
            $scope.showAlert('Atenção', '<p>Informe o Nome e Senha</p>');
        }
    }


});