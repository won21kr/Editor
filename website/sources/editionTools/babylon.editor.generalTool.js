var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BABYLON;
(function (BABYLON) {
    var EDITOR;
    (function (EDITOR) {
        var GeneralTool = (function (_super) {
            __extends(GeneralTool, _super);
            /**
            * Constructor
            * @param editionTool: edition tool instance
            */
            function GeneralTool(editionTool) {
                var _this = _super.call(this, editionTool) || this;
                // Public members
                _this.object = null;
                _this.tab = "GENERAL.TAB";
                // Private members
                _this._isActiveCamera = false;
                _this._isActivePlayCamera = false;
                _this._currentInstance = "";
                // Initialize
                _this.containers = [
                    "BABYLON-EDITOR-EDITION-TOOL-GENERAL"
                ];
                return _this;
            }
            // Object supported
            GeneralTool.prototype.isObjectSupported = function (object) {
                if (object instanceof BABYLON.AbstractMesh
                    || object instanceof BABYLON.Light
                    || object instanceof BABYLON.Camera
                    || object instanceof BABYLON.LensFlareSystem) {
                    return true;
                }
                return false;
            };
            // Creates the UI
            GeneralTool.prototype.createUI = function () {
                // Tabs
                this._editionTool.panel.createTab({ id: this.tab, caption: "General" });
            };
            // Update
            GeneralTool.prototype.update = function () {
                var _this = this;
                var object = this.object = this._editionTool.object;
                var scene = this._editionTool.core.currentScene;
                var core = this._editionTool.core;
                _super.prototype.update.call(this);
                if (!object)
                    return false;
                this._element = new EDITOR.GUI.GUIEditForm(this.containers[0], this._editionTool.core);
                this._element.buildElement(this.containers[0]);
                this._element.remember(object);
                // General
                var generalFolder = this._element.addFolder("Common");
                generalFolder.add(object, "name").name("Name").onChange(function (result) {
                    var sidebar = _this._editionTool.core.editor.sceneGraphTool.sidebar;
                    var element = sidebar.getSelectedNode();
                    if (element) {
                        element.text = result;
                        sidebar.refresh();
                    }
                });
                // Camera
                if (object instanceof BABYLON.Camera) {
                    var cameraFolder = this._element.addFolder("Camera");
                    if (object !== core.camera) {
                        this._isActivePlayCamera = object === core.playCamera;
                        cameraFolder.add(this, "_isActivePlayCamera").name("Set Play Camera").listen().onFinishChange(function (result) {
                            if (result === true) {
                                core.playCamera = object;
                                if (core.isPlaying)
                                    core.currentScene.activeCamera = object;
                            }
                            else {
                                result = true;
                            }
                        });
                    }
                    this._isActiveCamera = object === core.currentScene.activeCamera;
                    cameraFolder.add(this, "_isActiveCamera").name("Active Camera").listen().onFinishChange(function (result) {
                        if (result === true) {
                            core.currentScene.activeCamera = object;
                        }
                        else {
                            result = true;
                        }
                    });
                    cameraFolder.add(this.object, "maxZ").min(0).step(0.1).name("Far Value");
                    cameraFolder.add(this.object, "minZ").min(0).step(0.1).name("Near Value");
                    if (object["speed"] !== undefined)
                        cameraFolder.add(this.object, "speed").min(0).step(0.001).name("Speed");
                    if (object.fov)
                        cameraFolder.add(this.object, "fov").min(0).max(10).step(0.001).name("Fov");
                }
                // Transforms
                var transformFolder = this._element.addFolder("Transforms");
                if (object.position) {
                    var positionFolder = this._element.addFolder("Position", transformFolder);
                    positionFolder.add(object.position, "x").step(0.1).name("x");
                    positionFolder.add(object.position, "y").step(0.1).name("y");
                    positionFolder.add(object.position, "z").step(0.1).name("z");
                }
                if (object.rotation) {
                    var rotationFolder = this._element.addFolder("Rotation", transformFolder);
                    rotationFolder.add(object.rotation, "x").name("x").step(0.1);
                    rotationFolder.add(object.rotation, "y").name("y").step(0.1);
                    rotationFolder.add(object.rotation, "z").name("z").step(0.1);
                }
                if (object.scaling) {
                    var scalingFolder = this._element.addFolder("Scaling", transformFolder);
                    scalingFolder.add(object.scaling, "x").name("x").step(0.1);
                    scalingFolder.add(object.scaling, "y").name("y").step(0.1);
                    scalingFolder.add(object.scaling, "z").name("z").step(0.1);
                }
                // Rendering
                if (object instanceof BABYLON.AbstractMesh) {
                    var collisionsFolder = this._element.addFolder("Collisions");
                    collisionsFolder.add(object, "checkCollisions").name("Check Collision");
                    collisionsFolder.add(object, "isBlocker").name("Is Blocker");
                    var renderingFolder = this._element.addFolder("Rendering");
                    renderingFolder.add(object, "receiveShadows").name("Receive Shadows");
                    renderingFolder.add(object, "applyFog").name("Apply Fog");
                    renderingFolder.add(object, "isVisible").name("Is Visible");
                    renderingFolder.add(this, "_castShadows").name("Cast Shadows").onChange(function (result) {
                        if (result === true) {
                            var dialog = new EDITOR.GUI.GUIDialog("CastShadowsDialog", _this._editionTool.core, "Shadows Generator", "Make children to cast shadows");
                            dialog.callback = function (data) {
                                if (data === "Yes") {
                                    _this._setChildrenCastingShadows(object);
                                }
                            };
                            dialog.buildElement(null);
                        }
                    });
                }
                // Instances
                if (object instanceof BABYLON.Mesh) {
                    var instancesFolder = this._element.addFolder("Instances");
                    var instances = [];
                    for (var i = 0; i < object.instances.length; i++)
                        instances.push(object.instances[i].name);
                    if (this._currentInstance === "" && instances.length > 0)
                        this._currentInstance = instances[0];
                    if (instances.length > 0) {
                        instancesFolder.add(this, "_currentInstance", instances).name("Instance").onFinishChange(function (result) {
                            var index = instances.indexOf(result);
                            if (!object.instances[index])
                                _this.update();
                            else {
                                _this._editionTool.isObjectSupported(object.instances[index]);
                            }
                        });
                        instancesFolder.add(this, "_removeInstance").name("Remove instance...").onFinishChange(function () { return _this.update(); });
                    }
                    instancesFolder.add(this, "_createNewInstance").name("Create new instance...").onChange(function () { return _this.update(); });
                }
                return true;
            };
            Object.defineProperty(GeneralTool.prototype, "_castShadows", {
                // If object casts shadows or not
                get: function () {
                    var scene = this.object.getScene();
                    for (var i = 0; i < scene.lights.length; i++) {
                        var light = scene.lights[i];
                        var shadows = light.getShadowGenerator();
                        if (!shadows)
                            continue;
                        var shadowMap = shadows.getShadowMap();
                        for (var j = 0; j < shadowMap.renderList.length; j++) {
                            var mesh = shadowMap.renderList[j];
                            if (mesh === this.object)
                                return true;
                        }
                    }
                    return false;
                },
                // Sets if object casts shadows or not
                set: function (cast) {
                    var scene = this.object.getScene();
                    var object = this.object;
                    for (var i = 0; i < scene.lights.length; i++) {
                        var light = scene.lights[i];
                        var shadows = light.getShadowGenerator();
                        if (!shadows)
                            continue;
                        var shadowMap = shadows.getShadowMap();
                        if (cast)
                            shadowMap.renderList.push(object);
                        else {
                            var index = shadowMap.renderList.indexOf(object);
                            if (index !== -1)
                                shadowMap.renderList.splice(index, 1);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            // Sets children casting shadows
            GeneralTool.prototype._setChildrenCastingShadows = function (node) {
                var scene = node.getScene();
                for (var i = 0; i < node.getDescendants().length; i++) {
                    var object = node.getDescendants()[i];
                    if (!(object instanceof BABYLON.AbstractMesh))
                        continue;
                    for (var j = 0; j < scene.lights.length; j++) {
                        var light = scene.lights[j];
                        var shadows = light.getShadowGenerator();
                        if (!shadows)
                            continue;
                        var shadowMap = shadows.getShadowMap();
                        var index = shadowMap.renderList.indexOf(object);
                        if (index === -1)
                            shadowMap.renderList.push(object);
                    }
                    this._setChildrenCastingShadows(object);
                }
            };
            // Create a new instance
            GeneralTool.prototype._createNewInstance = function () {
                EDITOR.SceneFactory.AddInstancedMesh(this._editionTool.core, this.object);
            };
            // Removes instances
            GeneralTool.prototype._removeInstance = function () {
                if (this._currentInstance === "")
                    return;
                var object = this.object;
                for (var i = 0; i < object.instances.length; i++) {
                    if (object.instances[i].name === this._currentInstance) {
                        object.instances[i].dispose(false);
                        break;
                    }
                }
            };
            return GeneralTool;
        }(EDITOR.AbstractDatTool));
        EDITOR.GeneralTool = GeneralTool;
    })(EDITOR = BABYLON.EDITOR || (BABYLON.EDITOR = {}));
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.editor.generalTool.js.map
