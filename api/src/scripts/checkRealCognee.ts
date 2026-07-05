import { cogneeGateway } from '../ai/gateways/CogneeGateway';

async function main() {
  console.log("Calling Cognee search for 'Captain Hook' directly...");
  const dataStr = await cogneeGateway.search(
    "Captain Hook SuperScaleGraph HookEnterprise",
    ["demo-tenant-123"]
  );
  console.log("Length:", dataStr.length);
  console.log("Data:");
  console.log(dataStr);
}

main().catch(console.error);
