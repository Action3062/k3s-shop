import { auth } from "@/auth";
import { NavBar } from "./NavBar";

export async function Nav() {
  const session = await auth();
  return <NavBar loggedIn={!!session} />;
}
