import { Factory } from "fishery";

import type {
  AdditionalController,
  Controller,
  ControllerLocation,
  JujuState,
  ModelsList,
  ModelListInfo,
} from "store/juju/types";
import type { ModelWatcherData } from "juju/types";
import { modelWatcherModelDataFactory } from "./model-watcher";

interface ModelData {
  name: string;
  owner: string;
  uuid: string;
  version?: string;
  type?: string;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const additionalControllerFactory = Factory.define<AdditionalController>(
  () => ({
    additionalController: true,
  })
);

export const controllerLocationFactory = Factory.define<ControllerLocation>(
  () => ({
    region: "aws",
  })
);

export const controllerFactory = Factory.define<Controller>(() => ({
  path: "admin/jaas",
  uuid: "a030379a-940f-4760-8fcf-3062b41a04e7",
}));

export const modelListInfoFactory = Factory.define<ModelListInfo>(() => ({
  name: "test-model",
  ownerTag: "user-eggman@external",
  type: "iaas",
  uuid: "84e872ff-9171-46be-829b-70f0ffake18d",
}));

export const jujuStateFactory = Factory.define<
  JujuState,
  { models: (Omit<ModelData, "uuid"> & { uuid?: ModelData["uuid"] })[] }
>(({ transientParams }) => {
  const modelWatcherData: ModelWatcherData = {};
  const modelsList: ModelsList = {};
  transientParams.models?.forEach((modelParams) => {
    const model = {
      ...modelParams,
      uuid: modelParams.uuid ?? generateUUID(),
    };

    modelsList[model.name] = modelListInfoFactory.build({
      name: model.name,
      ownerTag: `user-${model.owner}`,
      uuid: model.uuid,
    });

    modelWatcherData[model.uuid] = modelWatcherModelDataFactory.build({
      model,
    });
  });
  return {
    controllers: null,
    // XXX When the models list is updated the uuids created for the models list
    // will need to be internally consistent with the modelWatcher data.
    models: modelsList,
    modelData: null,
    modelWatcherData: modelWatcherData,
  };
});
