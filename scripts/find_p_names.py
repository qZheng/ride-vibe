import inspect, pprint
pprint.pp(getattr(client.search, "query").__signature__)
