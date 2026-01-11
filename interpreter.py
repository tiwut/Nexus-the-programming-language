#!/usr/bin/env python3
import re, sys, os, tkinter as tk
from tkinter import messagebox, simpledialog

class NexusTitan:
    def __init__(self):
        self.vars = {"OS": "Linux", "VER": "1.1"}
        self.funcs = {}
        self.root = None

    def tokenize(self, code):
        tokens_def = [
            ('COMMENT', r'#.*'), ('KEYWORD', r'\b(fn|set|out|if|else|loop|end|wait|input)\b'),
            ('MODULE', r'\b(sys|gui|io|net|math)\b'), ('NUMBER', r'\d+'),
            ('ID', r'[a-zA-Z_]\w*'), ('ASSIGN', r'='), ('STRING', r'"[^"]*"'),
            ('LPAREN', r'\('), ('RPAREN', r'\)'), ('COMMA', r','),
            ('OP', r'[+\-*/><=]+'), ('SEP', r';'), ('SKIP', r'[ \t\n\r]+'), ('MISMATCH', r'.'),
        ]
        reg = '|'.join('(?P<%s>%s)' % p for p in tokens_def)
        return [m for m in ((mo.lastgroup, mo.group()) for mo in re.finditer(reg, code)) if m[0] not in ('SKIP', 'COMMENT')]

    def run(self, tokens):
        i = 0
        while i < len(tokens):
            kind, val = tokens[i]
            if kind == 'KEYWORD':
                if val == 'set':
                    name = tokens[i+1][1]; i += 3
                    res, i = self.expr(tokens, i)
                    self.vars[name] = res
                elif val == 'out':
                    i += 1; res, i = self.expr(tokens, i); print(f"Nexus › {res}")
                elif val == 'input':
                    var_name = tokens[i+1][1]
                    prompt = tokens[i+2][1].strip('"') if tokens[i+2][0] == 'STRING' else "Input"
                    self.vars[var_name] = simpledialog.askstring("Nexus", prompt) if self.root else input(prompt+": ")
                    i += 3
                elif val == 'fn':
                    name = tokens[i+1][1]; i += 4; start = i; d = 1
                    while d > 0 and i < len(tokens):
                        if tokens[i][1] == 'fn': d += 1
                        if tokens[i][1] == 'end': d -= 1
                        i += 1
                    self.funcs[name] = tokens[start:i-1]
                else: i += 1
            elif kind == 'MODULE':
                _, i = self.parse_module_call(tokens, i)
            elif kind == 'ID' and val in self.funcs:
                self.run(self.funcs[val]); i += 1
            else: i += 1

    def parse_module_call(self, tokens, i):
        mod = tokens[i][1]; func = tokens[i+2][1]; i += 4
        args = []
        while i < len(tokens) and tokens[i][0] != 'RPAREN':
            if tokens[i][0] == 'COMMA': i += 1; continue
            arg_res, i = self.expr(tokens, i); args.append(arg_res)
        if i < len(tokens): i += 1
        return self.call_mod(mod, func, args), i

    def expr(self, tokens, i):
        if i >= len(tokens): return "", i
        res = ""
        kind, val = tokens[i]
        if kind == 'MODULE':
            res, i = self.parse_module_call(tokens, i)
        elif kind == 'NUMBER': res = int(val); i += 1
        elif kind == 'STRING': res = val.strip('"'); i += 1
        elif kind == 'ID': res = self.vars.get(val, ""); i += 1
        
        while i < len(tokens) and tokens[i][0] == 'OP' and tokens[i][1] == '+':
            i += 1
            right, i = self.expr(tokens, i); res = str(res) + str(right)
        return res, i

    def call_mod(self, mod, func, args):
        if mod == 'gui':
            if func == 'window':
                self.root = tk.Tk(); self.root.title(args[0]); self.root.geometry("400x300")
            elif func == 'label': tk.Label(self.root, text=args[0]).pack(pady=10)
            elif func == 'button':
                tk.Button(self.root, text=args[0], command=lambda t=args[1]: self.run(self.funcs[t])).pack(pady=5)
            elif func == 'msg': messagebox.showinfo("Nexus", args[0])
            elif func == 'run': self.root.mainloop()
        elif mod == 'io':
            if func == 'write':
                mode = 'w' if str(args[1]) == "" else 'a'
                with open(args[0], mode) as f: 
                    if args[1] != "": f.write(str(args[1]) + "\n")
            elif func == 'read':
                if os.path.exists(args[0]):
                    with open(args[0], 'r') as f: return f.read().replace('\n', ' | ')
                return "No Events"
        return ""

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f: NexusTitan().run(NexusTitan().tokenize(f.read()))