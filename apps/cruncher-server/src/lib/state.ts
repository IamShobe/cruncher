const stateDirPath = `${process.env.HOME}/.local/share/cruncher/`;

export const getStateDirPath = () => {
  if (!stateDirPath) {
    throw new Error("State directory path is not set");
  }
  return stateDirPath;
};
