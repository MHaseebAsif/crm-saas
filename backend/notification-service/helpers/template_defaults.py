TPLS = {
    "welcome": "Welcome {name}!",
    "reset": "Your reset code is {code}"
}

def get_tpl(t: str) -> str:
    return TPLS.get(t, "Hello {name}")
