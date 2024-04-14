import { ServiceContext } from "../surface.app.ctx";

export function ping({ json }: ServiceContext) {
  return json({ message: "pong" });
}
