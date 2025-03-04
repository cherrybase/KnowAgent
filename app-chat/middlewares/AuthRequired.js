export default function middleware({ request, response, next }) {
  if (!request.session || !request.session.user) {
    return { error: "Unauthorized" };
  }
  return true;
}
