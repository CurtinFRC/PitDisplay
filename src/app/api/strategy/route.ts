var data = "";

export async function GET(request: Request) {
  if (request.headers.get("get_data") == "true") { return new Response(data); }
  
  console.log(request.headers.get("get_data"))
  console.log(request.body);
  data += request.text();

  return new Response();
}
