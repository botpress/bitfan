import * as sdk from "bitfan/sdk";
import fse from "fs-extra";
import path from "path";
import recursive from "recursive-readdir";
import BbPromise from "bluebird";
import _ from "lodash";

const allTypes: sdk.ProblemType[] = [
  "intent",
  "intent-topic",
  "lang",
  "multi-intent",
  "multi-intent-topic",
  "slot",
  "spell",
  "topic",
];

const ROOT_DIR = "../../../datasets";

const fileNameFormat = /[a-zA-Z0-9_-]*(?:\.test|\.train)?\.[a-z]{2}\.(?:ds|doc)\.json$/;

const _makeFileName = (
  name: string,
  lang: string,
  app: sdk.LearningApproach,
  stage?: sdk.Stage
) => {
  let fileName = name;
  fileName += stage ? `.${stage}` : "";
  fileName += `.${lang}`;
  fileName += app === "unsupervised" ? `.doc` : ".ds";
  fileName += ".json";
  return fileName;
};

const _parseFileName = (fileName: string) => {
  const parts = fileName.split(".");
  parts.pop(); // rm .json
  const approach: sdk.LearningApproach =
    parts.pop()! === "doc" ? "unsupervised" : "supervised";
  const lang = parts.pop()!;
  const name = parts.shift()!;
  const stage = parts.pop();
  return {
    name,
    lang,
    approach,
    stage,
  };
};

export const listDatasets: typeof sdk.datasets.listDatasets = async () => {
  const basePath = path.join(__dirname, ROOT_DIR);
  const types = allTypes.filter((t) => fse.existsSync(path.join(basePath, t)));
  return BbPromise.map(types, async (type) => {
    const basePathForType = path.join(basePath, type);
    const allFiles = await recursive(basePathForType);
    const matchingFiles = allFiles.filter(
      (f) => !!fileNameFormat.exec(path.basename(f))
    );

    return matchingFiles.map((f) => {
      const fPath = path.dirname(f);
      const fName = path.basename(f);

      const splitPath = (p: string) => p.split(path.sep);
      const namespace = _.xor(...[fPath, basePathForType].map(splitPath));

      return <sdk.FileDef<sdk.ProblemType, sdk.LearningApproach, sdk.Stage>>{
        ..._parseFileName(fName),
        type,
        namespace,
      };
    });
  }).then(_.flatten);
};

export const readDataset: typeof sdk.datasets.readDataset = async <
  T extends sdk.ProblemType,
  L extends sdk.LearningApproach,
  S extends sdk.Stage | undefined
>(
  info: sdk.FileDef<T, L, S>
) => {
  const { approach, lang, name, type, namespace, stage } = info;
  const fName = _makeFileName(name, lang, approach, stage);
  const fPath = path.join(
    __dirname,
    ROOT_DIR,
    type,
    namespace?.join(path.sep) ?? "",
    fName
  );
  const fileContent = await fse.readFile(fPath, "utf8");
  return JSON.parse(fileContent);
};
