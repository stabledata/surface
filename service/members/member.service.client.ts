import { User } from "../auth/auth.endpoints";

const fakeMembers: User[] = [
  {
    id: "123",
    name: "Alice",
    email: "alice@domain.com",
    roles: ["admin"],
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=80",
  },
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
    await new Promise((r) => setTimeout(r, 200));
    return fakeMembers;
  },
  getMember: async (id: string) => {
    await new Promise((r) => setTimeout(r, 1_000));
    const member = fakeMembers.find((m) => m.id === id);
    return member;
  },
};
