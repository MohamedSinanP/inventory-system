let navigator: (path: string) => void;

export const setNavigator = (nav: typeof navigator) => {
  navigator = nav;
};

export const navigateTo = (path: string) => {
  if (navigator) {
    navigator(path);
  } else {
    console.warn("Navigator not set yet");
  }
};