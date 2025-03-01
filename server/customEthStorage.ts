// import { FlatDirectory as OriginalFlatDirectory } from "ethstorage-sdk";
// import path from "path";
// import { fileURLToPath } from "url";
// import workerpool from "workerpool";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// class FlatDirectory extends OriginalFlatDirectory {
//   static async create(options: any) {
//     const instance = await super.create(options);
//     instance.pool = workerpool.pool(path.join(__dirname, 'worker.cjs.js'));
//     return instance;
//   }
// }

// export { FlatDirectory };