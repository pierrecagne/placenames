'use strict';

function PlacenameShowController($scope, $controller, $location, $routeParams, $timeout,
  NpolarMessage,
  PlacenameResource,
  npdcAppConfig) {
  'ngInject';

  let self = this;

  // EditController -> NpolarEditController
  $controller('NpolarEditController', {
    $scope: $scope
  });


  // Placename -> npolarApiResource -> ngResource
  $scope.resource = PlacenameResource;

  self.uuid = (id) => {
    let p = id.split('/');
    return p.pop();
  };

  self.translations = (prop, lang) => {
    return $scope.p.texts[prop];
  };

  self.loadRelations = (p) => {
    $scope.p = p;

    $location.path(p.id).search({name: p.name['@value'], area: p.area });

    if (!p.relations) {
      return;
    }

    // and the replaced might also be replaced :)
    $scope.replaces = [];
    (p.relations.replaces||[].concat(p.relations.same_as||[])).forEach(r => {
      let id = self.uuid(r['@id']);
      console.log(id);
      PlacenameResource.get({id}).$promise.then(r => {
        $scope.replaces.push(r);
      });
    });
  };

  self.show = () => {
    let name;
    let id;
    if (!(/[-]/).test($routeParams.id)) {
      name = $routeParams.id;
    }

    if (name) {
      $scope.resource.array({ 'filter-properties.label': name, fields: 'id,area,name.@value', limit: 10 }).$promise.then((r) => {

      if (r && r.length > 1) {
        let search = Object.assign({}, $location.search(), { q: name });
        $location.path('/').search(search);
      } else if (r && r.length === 1 && r[0].name['@value'] === name) {
          id = r[0].id;
          $location.path(id).search({name, area: r[0].area });
        } else {
         $scope.document = {};
         NpolarMessage.error(`Unknown name: ${name}`);
        }
      });

    } else {
      $scope.show().$promise.then(self.loadRelations);
    }

  };

  self.show();

}

module.exports = PlacenameShowController;