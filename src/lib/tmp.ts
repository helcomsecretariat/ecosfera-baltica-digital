import { createActor, setup, assign, and } from "xstate";

interface Context {
  userName: string;
  password: string;
  subContexts?: {
    changingPassword?: PassChangeSubContext;
  };
}

interface PassChangeSubContext {
  password: string;
  passwordConfirm: string;
}

export const parent = setup({
  types: {
    context: {} as Context,
  },
  guards: {
    isPassConfirmed: ({ context }) =>
      context.subContexts?.changingPassword?.password === context.subContexts?.changingPassword?.passwordConfirm,
    isSafePassword: ({ context }) => context.subContexts!.changingPassword!.password!.length >= 8,
  },
}).createMachine({
  context: { userName: "Foo", password: "42" },
  entry: ({ context }) => {
    document.body.innerHTML += context.userName + "<br>";
  },

  states: {
    idle: {
      on: {
        "click.changePassword": {
          target: "changingPassword",
        },
      },
    },
    changingPassword: {
      entry: assign({
        subContexts: ({ context }) => ({
          ...context.subContexts,
          changingPassword: {
            password: "",
            passwordConfirm: "",
          },
        }),
      }),
      exit: assign({
        subContexts: ({ context }) => ({
          ...context.subContexts,
          changingPassword: undefined,
        }),
      }),
      on: {
        "click.cancel": {
          target: "idle",
        },
        "click.OK": {
          guard: and(["isPassConfirmed", "isSafePassword"]),
          target: "idle",
          action: assign({
            passord: ({ context }) => context.subContexts.changingPassword.password,
          }),
        },
      },
    },
  },
});

createActor(parent).start();
