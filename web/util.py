def icon_to_file_name(icon, line):
    if 0 > icon or icon > 52:
        # fallback
        ico = 4
    else:
        ico = icon
    # Icon number to string:
    if ico < 10:
        ico = "0" + str(ico)
    else:
        ico = str(ico)
    # Add day & night to icon
    if ico not in ("04", "09", "10", "11", "12", "13", "14", "15", "22", "23", "30", "31", "32", "33", "34", "46", "47", "48", "49", "50"):
        if line[6] <= line[0] < line[7]:
            ico += "d"
        else:
            ico += "n"
    return ico