<img alt="logo" src="./docs/src/assets/cruncher_full_logo.png">

# Cruncher

<img alt="splash" src="./docs/src/assets/splash.png">

Ever wanted to post process your data?  
`Cruncher` is here for the rescue!

---

Heavily inspired from observability tools like `Splunk`, `Grafana` and more -  
it's main purpose is to allow post process data from multiple sources.  
Goal is to have a generic query language and to implement adapters to different backends - 
then you get all investigation capabilities right from the frontend.


## Macos installation
You can download the latest version from the [releases page](https://github.com/IamShobe/cruncher/releases/latest) -
Download the zip file extract, and move the `cruncher.app` to your `Applications` folder and run it.
If you encounter corruption issues run:
```bash
xattr -cr /Applications/cruncher.app
```

## Cruncher config file
Add a file named `cruncher.config.json` to your home directory at:
`~/.config/cruncher/cruncher.config.yaml`

The config file is a yaml file that contains the following fields:
```yaml
# Cruncher configuration file
connectors:
  - type: grafana_browser
    name: main
    params:
      grafanaUrl: <your_grafana_url> 
      uid: <your_loki_uid> # e.g. "logs"
      filter: 
        - key: label1
          value: "label1_value"
          operator: "="
      querySuffix: []
```


## QQL (Quick Query Language)
QQL is the main query language inside `Cruncher` - it's main goal is to have a quick - easy to learn language - that's powerful enought to allow power users access to enhanced capabilities over that data.  

The query language was heavily inspired from Splunk (SPL2) and Kusto (KQL).  

### Syntax

#### Event
- event is the most basic bulding block of the input of cruncher - it contains a timestamp, message and object (key, value) of the inputed data.
You can use qql to search and filter specific events from the full log.

#### search terms
search terms -  
In qql every word before a `pipe` is considered a search token - e.g.:
```qql
token1 token2 abc 3
```
here we have 4 different search tokens.  
When querying the backend we use that as:  
`word LIKE %token1% AND word LIKE %token2% AND ....`
Meaning that we check of existence of that text inside the matched `event`.

To specify full sentences use doubleqoutes (`"`) -  
```
token1 "a full sentence" token2
```
here we have 3 total search tokens:
- token1
- a full sentence
- token2

#### table
table command allows you to create a table view of specified columns from the event list:
```
token1 | table column1, column2
```
the result would be a view with 2 columns - `column1` and `column2`.

#### stats
stats command allows you to reduce the input results into aggregated columns:
```
token1 | stats avg(column1) by column2
```

syntax:
```
<tokens>... | stats <aggregationFunction>(<columnName>) [by <columns command separated>...]
```

`by` statement allows you to group by specific columns - and the aggregation function will be applied to each group.

available functions:
- `avg` - input column must be of type `number` - avg of all column results in group
- `max` - input column must be of type `number` - max of all column results in group
- `min` - input column must be of type `number` - min of all column results in group
- `sum` - input column must be of type `number` - sum of all column results in group
- `count` - count of all column results in group
- `first` - first value of the column in the group
- `last` - last value of the column in the group


#### regex

regex command allows you to extract values from the input event - and create new columns from that:
```
token1 | regex [field=<columnName>] `<regexPattern>`
```
If `field` is not specified - then cruncher will try to match against all the object record as a json (aka. `_raw` column).
If `_raw` doesn't exist - then it will try to match against the `message` column.
Use named groups to specify the column name - e.g.:
```
token1 | regex field=column1 `(?<subIndex>\d+)`
```

Then if the object is:
```json
{
  "column1": "some value 3"
}
```

The result would be:
```json
{
  "column1": "some value 3",
  "subIndex": "3"
}
```

#### sort

sort command allows you to sort the results by specific column:
```
token1 | sort column1
```

default is ascending - to specify descending use `desc` keyword:
```
token1 | sort column1 desc
```

you can also sort by multiple columns:
```
token1 | sort column1, column2 desc
```
In this case the first column will be sorted in ascending order - and the second column in descending order.

#### where

where command allows you to filter the results by specific column:
```
token1 | where column1 == "some value"
```

you can also use `!=`, `>`, `<`, `>=`, `<=`, `==` operators.

Moreover, special functions are also available:
##### string functions
- `contains` - check if the column contains the specified value
  - e.g. `| where contains(column1, "some")`
- `startsWith` - check if the column starts with the specified value
  - e.g. `| where startsWith(column1, "some")`
- `endsWith` - check if the column ends with the specified value
  - e.g. `| where endsWith(column1, "some")`
- `match` - check if the column matches the specified regex pattern
  - e.g. `| where match(column1, "^\d+$")`

##### general functions
- `isNull` - check if the column is null / undefined
  - e.g. `| where isNull(column1)`
- `isNotNull` - check if the column is not null / undefined
  - e.g. `| where isNotNull(column1)`


### Far Future plans
- [ ] offload calculation to a service worker.
