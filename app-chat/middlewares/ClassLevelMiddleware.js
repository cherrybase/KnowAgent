export default function middleware({ request, response, next }) {
  console.log("ClassLevelMiddleware")
  return true;
}
