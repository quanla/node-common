
module.exports = {
    createInjector: function() {

        var factories = {};
        var objects = {};
        var runs = [];

        function diInvoke(func) {
            var listStr = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '');
            var deps = listStr === '' ? [] : listStr.split(',');

            var args = [];
            for (var i = 0; i < deps.length; i++) {
                var objName = deps[i];
                args.push(resolve(objName));
            }
            return func.apply(null, args);
        }

        function resolve(name) {
            name = name.replace(/^\s+|\s+$/g, "");

            var object = objects[name];
            if (object != null) {
                return object;
            }

            // Creating it
            var factory = factories[name];
            if (factory == null) {
                throw "Error resolving [" + name + "]: Can not find factory function of [" + name + "]";
            }
            object = diInvoke(factory);

            objects[name] = object;
            return object;
        }

        var injector;
        return injector = {
            run: function(action) {
                runs.push(action);
                return injector;
            },
            runAll: function() {
                for (var i = 0; i < runs.length; i++) {
                    var run = runs[i];
                    try {
                        diInvoke(run);
                    } catch (e) {
                        console.error(e);
                    }
                }
            },
            setObjects: function(params) {
                for (var k in params) {
                    objects[k] = params[k];
                }
                return injector;
            },
            value: function(name, obj) {
                objects[name] = obj;
                return injector;
            },
            get: function(name) {
                return resolve(name);
            },
            factory: function(name, factory) {
                factories[name] = factory;
                return injector;
            }
        };
    }
};