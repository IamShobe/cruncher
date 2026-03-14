const configDirPath = `${process.env.HOME}/.config/cruncher/`;

export const getConfigDirPath = () => {
  if (!configDirPath) {
    throw new Error("Config directory path is not set");
  }
  return configDirPath;
};
