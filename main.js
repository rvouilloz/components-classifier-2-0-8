import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

const container = document.getElementById("container");
if (!container) {
  throw new Error('Container element not found');
}

const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);

const world = worlds.create();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();

world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

world.scene.setup();

const grids = components.get(OBC.Grids);
grids.create(world);

const fragments = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);
await fragmentIfcLoader.setup();
async function loadIfc() {
  const file = await fetch("./model/2.ifc");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = await fragmentIfcLoader.load(buffer);
  model.name = "example";
  world.scene.three.add(model);
  //CLASSIFIER :
  const classifier = components.get(OBC.Classifier);
  classifier.byEntity(model); //1
  classifier.byIfcRel(model, WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE, "storeys"); //2
  classifier.byIfcRel(model, WEBIFC.IFCPROPERTY, "prop"); //3
  console.log(classifier); // it finds 1 and 2, but not 3. Doesn't work with WEBIFC.IFCPROPERTYSET either
  const stairs = classifier.find({
    entities: ["IFCSTAIR"],
  });
  console.log(stairs); // works fine
  const storeys = classifier.find({
    //entities: ['"My Storey"']
    entities: ["My Storey"]
  });
  console.log(storeys); // doesn't find it, although it does exist in console.log(classifier)
  const prop = classifier.find({
    entities: ["whatever prop"]
  });
  console.log(prop); // obviously doesn't work because it doesn't even exist in console.log(classifier)
};
loadIfc();
