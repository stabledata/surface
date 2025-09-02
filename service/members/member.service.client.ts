import { User } from "../auth/auth.endpoints";

const fakeMembers: User[] = [
  {
    id: "123",
    email: "alice@domain.com",
    given_name: "Alice",
    family_name: "Smith",
    name: "Alice Smith",
    picture:
      "https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=80",
    // Legacy compatibility
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=80",
    roles: ["admin"],
  },
  {
    id: "2",
    email: "bob@member.net",
    given_name: "Bob",
    family_name: "Johnson",
    name: "Bob Johnson",
    picture: "",
    // Legacy compatibility
    profilePicture: "",
    roles: [],
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
