import * as fs from "fs";

const ipListFilePath = "./iplist.txt";

export const getIPList = (): string[] => {
  const ipList: string[] = [];

  const ipListFile = fs.readFileSync(ipListFilePath, "utf8");
  const lines = ipListFile.toString().split("\r\n");

  for (const line of lines) {
    // TODO: check CIDR format or not (/32, /16, etc...)
    const trimmedLine = line
      .replace(/ /g, "")
      .replace(/\t/g, "")
      .replace(/\n/g, "")
      .replace(/^([^#]+)#.*$/g, "$1");

    // TODO: check empty lines whether or not (need \n handlings??)
    const pattern = /^#/g;
    const result = trimmedLine.match(pattern);

    if (trimmedLine.length && !result) {
      ipList.push(line);
    }
  }

  return ipList;
};
