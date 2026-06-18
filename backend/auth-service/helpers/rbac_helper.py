def check_role(usr_role: str, req_role: str) -> bool:
    roles = {"super_admin": 3, "company_admin": 2, "employee": 1}
    return roles.get(usr_role, 0) >= roles.get(req_role, 0)
