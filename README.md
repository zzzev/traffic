# California Traffic Accident Visualization

A simple 24x7 chart of traffic accident data from California, from 2003-2012.

Data sourced from [SWITRS](http://tims.berkeley.edu/page.php?page=switrs_resources)

Created by [Zev Youra](zevyoura.com)

To create csv, run the following commands in a sqlite3 command line session in a directory with the data from the above SWITRS link:
    .mode csv

    .import collisions_2003to2012.csv collisions

    .headers on
    .output csv

    SELECT 
        CAST(TIME_ AS INTEGER) / 100 AS HOUR, 
        DAYWEEK, 
        COUNT(*) AS TOTAL, 
        SUM(CAST(ETOH == 'Y' AS INTEGER)) AS ALCOHOLRELATED,
        SUM(CAST(CRASHSEV == 1 AS INTEGER)) AS FATAL,
        SUM(CAST(PEDCOL == 'Y' AS INTEGER)) AS PEDESTRIAN,
        SUM(CAST(BICCOL == 'Y' AS INTEGER)) AS BICYCLE,
        SUM(CAST(MCCOL == 'Y' AS INTEGER)) AS MOTORCYCLE,
        SUM(CAST(VIOLCAT == 24 AS INTEGER)) AS SLEEP,
        SUM(CAST(HITRUN != 'N' AS INTEGER)) AS HITANDRUN
    FROM collisions WHERE HOUR != 25 GROUP BY 1, 2;