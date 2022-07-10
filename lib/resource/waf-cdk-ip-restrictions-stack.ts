import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { getIPList } from "../util/get-ip-list";
import { WafRegionValidator } from "../validator/waf-region-validator";

const ipListFilePath = "./iplist.txt";

export class WafCdkIpRestrictionsStack extends Stack {
  scopeType: string;
  ipList: string[];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.init();
    this.create();
  }

  private init() {
    this.scopeType = this.node.tryGetContext("scopeType") ?? "";
    this.ipList = getIPList(ipListFilePath);

    const wafRegionValidator = new WafRegionValidator(this.scopeType, this.region);
    this.node.addValidation(wafRegionValidator);
  }

  private create(): void {
    const whiteListIPSet = new wafv2.CfnIPSet(this, "WhiteListIPSet", {
      name: "WhiteListIPSet",
      addresses: this.ipList,
      ipAddressVersion: "IPV4",
      scope: this.scopeType,
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
      scope: this.scopeType,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "WebAcl",
        sampledRequestsEnabled: true,
      },
      rules: [whiteListIPSetRuleProperty],
    });
  }
}
