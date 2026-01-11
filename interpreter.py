#!/usr/bin/env python3
import re, sys, os, subprocess, time, platform, json, shutil, random
import tkinter as tk
from tkinter import messagebox, filedialog
import urllib.request, socket

class NexusTitan:
    def __init__(self):
        self.vars = {
            "OS": platform.system(), 
            "VER": "0.6", 
            "USER": os.getlogin() if platform.system() != "Windows" else "User",
            "ARCH": platform.machine(),
            "PI": 3.14159
        }
        self.funcs = {}
        self.gui_root = None

    def tokenize(self, code):
        tokens = [
            ('COMMENT',  r'//.*|#.*'), 
            ('KEYWORD',  r'\b(fn|set|out|if|else|loop|end|wait|input|return)\b'),
            ('MODULE',   r'\b(sys|gui|io|net|math|str|time)\b'), 
            ('NUMBER',   r'\d+(\.\d+)?'),
            ('ID',       r'[a-zA-Z_]\w*'), 
            ('ASSIGN',   r'='), 
            ('STRING',   r'"[^"]*"'),
            ('LPAREN',   r'\('), ('RPAREN',   r'\)'), 
            ('OP',       r'[+\-*/><=!&|]+'),
            ('SEP',      r';'), ('DOT',      r'\.'), 
            ('COMMA',    r','),
            ('SKIP',     r'[ \t\n\r]+'), 
            ('MISMATCH', r'.'),
        ]
        reg = '|'.join('(?P<%s>%s)' % p for p in tokens)
        return [m for m in ((mo.lastgroup, mo.group()) for mo in re.finditer(reg, code)) if m[0] not in ('SKIP', 'COMMENT')]

    def run(self, tokens, local_vars=None):
        variables = local_vars if local_vars is not None else self.vars
        i = 0
        while i < len(tokens):
            kind, val = tokens[i]
            
            if kind == 'KEYWORD':
                if val == 'set':
                    name = tokens[i+1][1]
                    i += 3
                    res, i = self.expr(tokens, i, variables)
                    variables[name] = res
                elif val == 'out':
                    i += 1
                    res, i = self.expr(tokens, i, variables)
                    print(f"Nexus › {res}")
                elif val == 'wait':
                    i += 1
                    res, i = self.expr(tokens, i, variables)
                    time.sleep(float(res))
                elif val == 'input':
                    var_name = tokens[i+1][1]
                    prompt = tokens[i+2][1].strip('"') if (i+2 < len(tokens) and tokens[i+2][0] == 'STRING') else "> "
                    variables[var_name] = input(prompt)
                    i += 2
                elif val == 'fn':
                    name = tokens[i+1][1]
                    i += 4
                    start = i
                    d = 1
                    while d > 0 and i < len(tokens):
                        if tokens[i][1] == 'fn': d += 1
                        if tokens[i][1] == 'end': d -= 1
                        i += 1
                    self.funcs[name] = tokens[start:i-1]
                elif val == 'if':
                    i += 1
                    cond, i = self.expr(tokens, i, variables)
                    start = i
                    d = 1
                    while d > 0 and i < len(tokens):
                        if tokens[i][1] in ['if', 'loop']: d += 1
                        if tokens[i][1] == 'end': d -= 1
                        i += 1
                    if cond: self.run(tokens[start:i-1], variables)
                else: i += 1

            elif kind == 'MODULE':
                mod, func = val, tokens[i+2][1]
                i += 4
                args = []
                while i < len(tokens) and tokens[i][0] != 'RPAREN':
                    arg, i = self.expr(tokens, i, variables)
                    args.append(arg)
                    if i < len(tokens) and tokens[i][0] == 'COMMA': i += 1
                if i < len(tokens): i += 1
                res = self.call_mod(mod, func, args)
                if res is not None: variables["_last"] = res
            
            elif kind == 'ID' and val in self.funcs:
                self.run(self.funcs[val], variables.copy())
                i += 3
            else: i += 1

    def expr(self, tokens, i, variables):
        if i >= len(tokens): return None, i
        kind, val = tokens[i]
        res = 0

        if kind == 'NUMBER': res = float(val) if '.' in val else int(val)
        elif kind == 'STRING': res = val.strip('"')
        elif kind == 'ID': res = variables.get(val, 0)
        elif kind == 'MODULE':
            mod = val
            func = tokens[i+2][1]
            i += 4
            args = []
            while tokens[i][0] != 'RPAREN':
                arg, i = self.expr(tokens, i, variables)
                args.append(arg)
                if tokens[i][0] == 'COMMA': i += 1
            res = self.call_mod(mod, func, args)
        
        i += 1
        while i < len(tokens) and tokens[i][0] == 'OP':
            op = tokens[i][1]
            i += 1
            right, i = self.expr(tokens, i, variables)
            if op == '+': 
                if isinstance(res, (int, float)) and isinstance(right, (int, float)): res += right
                else: res = str(res) + str(right)
            elif op == '-': res -= right
            elif op == '*': res *= right
            elif op == '/': res /= right
            elif op == '==': res = (res == right)
            elif op == '>': res = (res > right)
            elif op == '<': res = (res < right)
        
        return res, i

    def call_mod(self, mod, func, args):
        try:
            if func == 'read':
                if os.path.exists(args[0]):
                    with open(args[0], 'r') as f: return f.read()
                return "No events found."
            if mod == 'sys':
                if func == 'shell': return subprocess.run(args[0], shell=True, capture_output=True).stdout.decode()
                if func == 'exit': sys.exit()
                if func == 'info': return f"{platform.system()} {platform.machine()}"
            elif mod == 'math':
                if func == 'rand': return random.randint(int(args[0]), int(args[1]))
                if func == 'sqrt': return args[0]**0.5
            elif mod == 'gui':
                if func == 'window': self.gui_root = tk.Tk(); self.gui_root.title(args[0])
                if func == 'label': tk.Label(self.gui_root, text=args[0]).pack()
                if func == 'msg': messagebox.showinfo("Nexus", args[0])
                if func == 'color': self.gui_root.configure(bg=args[0])
                if func == 'run': self.gui_root.mainloop()
            elif mod == 'io':
                if func == 'write': 
                    with open(args[0], 'w') as f: f.write(str(args[1]))
                if func == 'read':
                    with open(args[0], 'r') as f: return f.read()
            elif mod == 'net':
                if func == 'ip': return socket.gethostbyname(socket.gethostname())
                if func == 'get': return urllib.request.urlopen(args[0]).read().decode()[:100]
            elif mod == 'time':
                if func == 'now': return time.strftime("%H:%M:%S")
        except Exception as e:
            return f"Error in {mod}.{func}: {e}"
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            nx = NexusTitan()
            nx.run(nx.tokenize(f.read()))
    else:
        print("Nexus v0.6 - Bitte Datei angeben: ./c.py test.nx")
