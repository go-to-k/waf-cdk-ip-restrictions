import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import * as fs from "fs";

const scopeType = process.env.SCOPE_TYPE ?? "";
const ipListFilePath = "./iplist.txt";
export class WafCdkIpRestrictionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.validate(scopeType, props?.env?.region ?? "");

    const ipList = this.getIPList();

    const whiteListIPSet = new wafv2.CfnIPSet(this, "WhiteListIPSet", {
      name: "WhiteListIPSet",
      addresses: ipList,
      ipAddressVersion: "IPV4",
      scope: scopeType,
    });

    const whiteListIPSetRuleProperty: wafv2.CfnWebACL.RuleProperty = {
      priority: 0,
      name: "WhiteListIPSet-Rule",
      action: {
        allow: {},
      },
      statement: {
        ipSetReferenceStatement: {
          arn: whiteListIPSet.attrArn,
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "WhiteListIPSet-Rule",
        sampledRequestsEnabled: true,
      },
    };

    const webAcl = new wafv2.CfnWebACL(this, "WebAcl", {
      name: "WebAcl",
      defaultAction: { block: {} },
      scope: scopeType,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "WebAcl",
        sampledRequestsEnabled: true,
      },
      rules: [whiteListIPSetRuleProperty],
    });
  }

  private validate(scopeType: string, region: string): void {
    if (scopeType !== "CLOUDFRONT" && scopeType !== "REGIONAL") {
      throw new Error("Scope must be CLOUDFRONT or REGIONAL.");
    }
    if (scopeType === "CLOUDFRONT" && region !== "us-east-1") {
      throw new Error("Region must be us-east-1 when CLOUDFRONT.");
    }
  }

  // TODO: move this to utils dir, and make unit tests (for public method)
  private getIPList(): string[] {
    const ipList: string[] = [];

    const ipListFile = fs.readFileSync(ipListFilePath, "utf8");
    const lines = ipListFile.toString().split("\r\n");

    for (const line of lines) {
      const trimmedLine = line
        .replace(/ /g, "")
        .replace(/\t/g, "")
        .replace(/\n/g, "")
        .replace(/^([^#]+)#.*$/g, "$1");

      // TODO: check empty lines whether or not (need \n??)
      const pattern = /^#/g;
      const result = trimmedLine.match(pattern);

      if (trimmedLine.length && !result) {
        ipList.push(line);
      }
    }

    return ipList;
  }
}
