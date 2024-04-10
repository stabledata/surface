import { ServiceContext } from "../surface.app";

export function ping({ json }: ServiceContext) {
  return json({ message: "pong" });
}
