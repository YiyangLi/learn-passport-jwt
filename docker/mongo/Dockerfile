FROM mongo

COPY init.json /init.json
CMD mongoimport --host mongodb --db learn-passport --collection users --type json --file /init.json --jsonArray && \
  mongoimport --host mongodb --db test --collection users --type json --file /init.json --jsonArray
