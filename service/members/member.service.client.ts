import { User } from "../auth/auth.endpoints";
import { fakeUser } from "../auth/auth.helpers";

const fakeMembers: User[] = [
  fakeUser,
  {
    name: "Bob",
    email: "bob@member.net",
    id: "2",
    roles: [],
    profilePicture: "",
  },
];

// we can pretend this our our client which we want in our gateway API contexts.
// ideally, it's generated from the down stream services we are calling from the gateway.
export const memberServiceClient = {
  getMembers: async (): Promise<User[]> => {
    // testing this method as an example now, so don't delay too much
    // await new Promise((r) => setTimeout(r, 200));
    return fakeMembers;
  },
  getMember: async (id: string) => {
    await new Promise((r) => setTimeout(r, 1_000));
    const member = fakeMembers.find((m) => m.id === id);
    return member;
  },
};
