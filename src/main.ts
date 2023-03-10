import "./style.css";
import typescriptLogo from "./typescript.svg";
import { Action, createStore, Middleware, MiddlewareNext } from "../lib/main";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

export type State = {
  count: number;
};

function reducer(state: State, action: Action) {
  if (action.type === "inc") {
    return {
      ...state,
      count: state.count + 1,
    };
  }
  if(action.type === 'asyncDec') {
    return {
      ...state,
      count: state.count - 1
    }
  }
  return state;
}

const logMiddleware: Middleware<State, Action> = ({ getState }) => {
  return (next) => (action) => {
    console.log("action:", action);
    next(action);
    console.log("state:", getState());
  };
};

const thunkMiddleware: Middleware<State, Action | Function> = ({dispatch}) => {
  return (next) => (action) => {
    if (typeof action === "function") {
      action(dispatch, getState);
    }
    next(action);
  };
};

const store = createStore<State, any>(reducer, { count: 1 }, [
  thunkMiddleware,
  logMiddleware,
]);

const { getState, dispatch, subscribe } = store;

const element = document.querySelector<HTMLButtonElement>("#counter")!;

element.addEventListener("click", () => {
  dispatch({
    type: "inc",
  });
  dispatch((_dispatch: MiddlewareNext<Action>) => {
    setTimeout(() => {
      _dispatch({
        type: 'asyncDec'
      })
    }, 3000)
  })
});

function setText() {
  element.innerHTML = `count is ${getState().count}`;
}

setText();

subscribe(setText);
