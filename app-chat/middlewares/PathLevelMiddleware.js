export default function middleware({ request, response, next }) {
  console.log("PathLevelMiddleware")
  return true;
}
