from datetime import datetime

def log_timestamp():
    timestamp = datetime.now().isoformat()
    with open("loop-log.txt", "a") as f:
        f.write(f"{timestamp}\n")

if __name__ == "__main__":
    print("Hello from the loop!")
    log_timestamp()
