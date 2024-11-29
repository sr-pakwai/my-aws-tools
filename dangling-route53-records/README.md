# Dangling Route 53 Records

A project to manage dangling Route 53 records.

## Purpose

Automate the process of detecting and removing dangling Route 53 records.

## Description

This project aims to simplify the process of managing Route 53 records by providing a tool to detect and remove dangling records.

## Usage

### Input

* AWS credentials with access to Route 53
* A list of hosted zones to check for dangling records

### Output

* A CSV file with the following structure:
  * hostedZoneId
  * recordName
  * recordType
  * pingResult

Example output:
```
hostedZoneId,recordName,recordType,pingResult
ZONE_ID,RECORD_NAME,A,RESULT
