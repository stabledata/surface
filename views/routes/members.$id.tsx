import {
  createFileRoute,
  ErrorComponentProps,
  Link,
} from "@tanstack/react-router";
import { User } from "../../services/auth.service";
import { ArrowLeft } from "lucide-react";
import { useLoginRedirect } from "../hooks/use-login-redirect";

export const Route = createFileRoute("/members/$id")({
  loader: async ({ context, params }): Promise<User | undefined> => {
    const member = await context.rpc?.api.members[":id"].$get({
      param: { id: params.id },
    });
    // throw new Error("test");
    if (!member?.ok) {
      return undefined;
    }
    return (await member.json()) as User;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorComponent: PostErrorComponent as any,
  component: PostComponent,
});

export function PostErrorComponent({ error }: ErrorComponentProps) {
  return <div>an {JSON.stringify(error)} happened</div>;
}

function PostComponent() {
  // if you want to avoid rendering things server side,
  // set a value and return null if it's undefined
  useLoginRedirect();
  const member = Route.useLoaderData();

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">{member?.name}</h4>
      <div className="text-sm">{member?.email}</div>
      <Link to="/members" className="flex items-start gap-3 font-light">
        <ArrowLeft /> Back to members page
      </Link>
    </div>
  );
}
