from semantic_search import search_best

def spot_feature(feature: str):
    return search_best(feature, clip_len=8)

if __name__ == "__main__":
    print(spot_feature("wooden bridge crossing"))
