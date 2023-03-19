app.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $ionicPopover, $timeout, $ionicPlatform, $state,$stateParams) {
    // Form data for the login modal
    $scope.loginData = {};
    ///////////////

    $scope.versao = '0.0.21';

    /////////
    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {

        //            navIcons.addEventListener('click', function () {
        //                this.classList.toggle('active');
        //            });
    }




    // .fromTemplate() method
    var template = '<ion-popover-view>' +
        '   <ion-header-bar>' +
        '       <h1 class="title">Opções de Navegação</h1>' +
        '   </ion-header-bar>' +
        '   <ion-content class="padding">' +
        '       Criar nova tarefa' +
        '   </ion-content>' +
        '</ion-popover-view>';
    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });

    $scope.close = function () {
        ionic.Platform.exitApp()
        window.close();
    }

    $scope.voltar = function () {

        if ($rootScope.historico && $rootScope.historico.name && $rootScope.historico.funcao && $rootScope.historico.scope) {
            $rootScope.historico.scope[$rootScope.historico.funcao]();
            return;
        }

        var rota = null;
        var rotaAlt = null;
        switch ($state.current.name) {
            case 'app.bf':
            case 'app.listaParcela':
                rotaAlt = 'app.listaTalhao';
                if ($stateParams.talhao) {
                    var fazenda = angular.fromJson($stateParams.talhao);
                    $state.go(rotaAlt, {fazenda: angular.toJson(fazenda)});
                }
                break;
            case 'app.listaTalhao':
                rota = 'app.preCorteLista';
                break;
            case 'app.preCorteLista':
                rota = 'app.lancamentoHome';
                break;
            case 'app.lancamentoHome':
                rota = 'app.inicio';
                break;
            case 'app.inicio':
                break;
            case 'app.lancarParcela':
                rotaAlt = 'app.listaParcela';
                
                if ($stateParams.parcela) {
                    var parcela = angular.fromJson($stateParams.parcela);
                    $state.go(rotaAlt, {talhao: angular.toJson(parcela)});
                }
                break;
            case 'app.lancarArvore':
                rotaAlt = 'app.lancarParcela';
                if ($stateParams.lancamento) {
                    var lancamento = angular.fromJson($stateParams.lancamento);
                    $state.go(rotaAlt, {parcela: angular.toJson(lancamento)});
                }
                break;
            case 'app.finalizarParcela':
                rotaAlt = 'app.lancarArvore';
                if ($stateParams.lancamentoParcela) {
                    var lancamentoParcela = angular.fromJson($stateParams.lancamentoParcela);
                    $state.go(rotaAlt, {lancamento: angular.toJson(lancamentoParcela)});
                }
                break;
            default:
                window.history.back();
                break;
        };

        if (rota) {
            $state.go(rota);
        }
    }

});