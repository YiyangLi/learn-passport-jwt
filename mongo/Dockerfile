FROM mongo

COPY init.json /init.json
RUN sleep 10
RUN mongoimport --host mongodb --db reach-engine --collection MyDummyCollection --type json --file /init.json --jsonArray
