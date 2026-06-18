import random

def gen_otp() -> str:
    return str(random.randint(100000, 999999))
