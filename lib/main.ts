export interface Action {
  type: string;
  [extra: string]: any;
}

export interface Reducer<S, A> {
  (state: S, action: A): S;
}

export interface VoidFn {
  (): void;
}

export interface MiddlewareApi<S, A> {
  getState: () => S;
  dispatch: (action: A) => void
}

export interface MiddlewareNext<A> {
   (action: A): void
} 

export interface Middleware<S, A> {
  (api: MiddlewareApi<S, A>): (next: MiddlewareNext<A>) => MiddlewareNext<A>
}

export function compose(...funcs: Function[]) {
  function initFc<T>(arg: T) {
    return arg;
  }
  return funcs.reduce((a, b) => {
    return (...args: any) => a(b(...args));
  }, initFc);
}

export function createStore<S, A extends Action = Action>(
  reducer: Reducer<S, A>,
  preState: S,
  middlewares?: Middleware<S, A>[]
) {
  let state: S = preState;

  const callbacks = new Set<VoidFn>();

  function getState() {
    return state;
  }

  function dispatch(action: A) {
    state = reducer(state, action);

    callbacks.forEach((fn) => fn());
  }

  function subscribe(listener: VoidFn) {
    callbacks.add(listener);
    return () => {
      callbacks.delete(listener);
    };
  }

  function applyMiddleware() {
    const chain = middlewares!.map((m) => m({ getState, dispatch }));
    return compose(...chain)(dispatch);
  }

  return {
    getState,
    dispatch: middlewares?.length ? applyMiddleware() : dispatch,
    subscribe,
  };
}
