# waf-cdk-ip-restrictions

The description in **Japanese** is available on the following blog page. -> [Blog](https://go-to-k.hatenablog.com/entry/waf-cdk-ip-restrictions)

## What

A CDK stack that creates WAF (WebACL) with flexible IP restrictions.

With the following configuration file(IP whitelist), you can deploy without change CloudFormation templates when you increase or decrease IP addresses.

- iplist.txt

```
x.x.x.1/32
x.x.x.2/32
```

## How to

### IP Whitelist

Change the IP Whitelist: [iplist.txt](./iplist.txt)

### Install

```sh
npm i
```

### Deploy

```sh
npx cdk deploy
```

### Destroy

```sh
npx cdk destroy
```
