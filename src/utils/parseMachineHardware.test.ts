import { parseMachineHardware } from "./parseMachineHardware";

it("parses attributes", () => {
  expect(
    parseMachineHardware(
      "arch=amd64 cores=1 mem=2GB availability-zone=danger virt-type=container",
    ),
  ).toStrictEqual({
    arch: "amd64",
    cores: "1",
    mem: "2GB",
    "availability-zone": "danger",
    "virt-type": "container",
  });
});
