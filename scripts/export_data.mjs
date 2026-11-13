// Exporta os dados estruturados do site (TypeScript) como JSON, para o gerador de PDF em Python.
// Os arquivos de dados só têm imports de tipo, que o Node remove sozinho (--experimental-strip-types).
const load = async (name) =>
  import(new URL(`../src/data/${name}.ts`, import.meta.url).href);
const { projects } = await load("projects");
const { technologies, techCategoryOrder } = await load("technologies");
const { experience, education } = await load("experience");
process.stdout.write(
  JSON.stringify({ projects, technologies, techCategoryOrder, experience, education }),
);
