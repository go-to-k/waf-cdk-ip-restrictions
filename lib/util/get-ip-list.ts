import * as fs from "fs";

const ipListFilePath = "./iplist.txt";

export const getIPList = (): string[] => {
  const ipList: string[] = [];

  const ipListFile = fs.readFileSync(ipListFilePath, "utf8");
  const lines = ipListFile.toString().split("\n");

  for (const line of lines) {
    const trimmedLine = line
      .replace(/ /g, "")
      .replace(/\t/g, "")
      .replace(/\n/g, "")
      .replace(/^([^#]+)#.*$/g, "$1");

    const commentOutPattern = /^#/g;
    const commentOutResult = trimmedLine.match(commentOutPattern);
    if (!trimmedLine.length || commentOutResult) continue;

    const cidrFormatPattern =
      /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}[1-9]?([0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-2]?[0-9]|3[0-2])$/g;
    const cidrFormatResult = trimmedLine.match(cidrFormatPattern);
    if (!cidrFormatResult) {
      throw new Error(`IP CIDR Format is invalid: ${trimmedLine}`);
    }

    ipList.push(trimmedLine);
  }

  return ipList;
};
