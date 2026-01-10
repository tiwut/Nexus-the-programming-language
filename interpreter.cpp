#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <fstream>
#include <regex>
#include <random>
#include <ctime>
#include <sstream>
#include <algorithm>
#include <unistd.h>

using namespace std;

map<string, string> vars;
map<string, vector<string>> funcs;

string trim(string s) {
    if (s.empty()) return s;
    s.erase(0, s.find_first_not_of(" \t\r\n"));
    size_t last = s.find_last_not_of(" \t\r\n");
    if (last != string::npos) s.erase(last + 1);
    return s;
}

string resolve(string input) {
    input = trim(input);
    if (input.empty()) return "";
    if (input.size() >= 2 && input.front() == '"' && input.back() == '"') {
        return input.substr(1, input.size() - 2);
    }
    if (vars.count(input)) return vars[input];
    return input;
}

void runNexus(vector<string> lines) {
    for (size_t i = 0; i < lines.size(); ++i) {
        string line = trim(lines[i]);
        if (line.empty() || line.substr(0, 2) == "//" || line[0] == '#') continue;

        smatch m;

        if (regex_search(line, m, regex(R"(set\s+(\w+)\s*=\s*(.*))"))) {
            string name = m[1];
            string val = m[2];
            
            if (val.find(" + ") != string::npos) {
                string leftPart = val.substr(0, val.find(" + "));
                string rightPart = val.substr(val.find(" + ") + 3);
                string left = resolve(leftPart);
                string right = resolve(rightPart);
                
                try {
                    double res = stod(left) + stod(right);
                    vars[name] = to_string(res);
                } catch (...) {
                    vars[name] = left + right;
                }
            } else {
                vars[name] = resolve(val);
            }
        }

        else if (regex_search(line, m, regex(R"(out\s+(.*))"))) {
            cout << "Nexus-CPP › " << resolve(m[1]) << endl;
        }

        else if (line.find("sys.shell(") != string::npos) {
            size_t start = line.find("(") + 1;
            size_t end = line.find_last_of(")");
            string cmd = resolve(line.substr(start, end - start));
            system(cmd.c_str());
        }
        else if (line.find("sys.info()") != string::npos) {
            cout << "Nexus Core v0.6 | OS: " << vars["OS"] << " | Arch: " << vars["ARCH"] << endl;
        }

        else if (line.find("gui.msg(") != string::npos) {
            size_t start = line.find("(") + 1;
            size_t end = line.find_last_of(")");
            string msg = resolve(line.substr(start, end - start));
            string cmd = "zenity --info --text=\"" + msg + "\" --title=\"Nexus GUI\" 2>/dev/null";
            system(cmd.c_str());
        }

        else if (line.substr(0, 2) == "fn") {
            string funcName = trim(line.substr(3, line.find("(") - 3));
            vector<string> body;
            i++;
            while (i < lines.size() && trim(lines[i]) != "end") {
                body.push_back(lines[i]);
                i++;
            }
            funcs[funcName] = body;
        }

        else if (line.substr(0, 5) == "wait ") {
            try {
                int seconds = stoi(resolve(line.substr(5)));
                sleep(seconds);
            } catch (...) {}
        }

        else if (line.find("()") != string::npos) {
            string funcName = line.substr(0, line.find("("));
            if (funcs.count(funcName)) {
                runNexus(funcs[funcName]);
            }
        }
    }
}

int main(int argc, char* argv[]) {
    srand(time(0));
    
    vars["OS"] = "Ubuntu/Linux";
    vars["ARCH"] = "x64";
    vars["VER"] = "0.6-Titan-CPP";

    if (argc < 2) {
        cout << "===============================" << endl;
        cout << "   NEXUS TITAN C++ INTERPRETER  " << endl;
        cout << "===============================" << endl;
        cout << "Usage: ./nexus <file.nx>" << endl;
        return 1;
    }

    ifstream file(argv[1]);
    if (!file.is_open()) {
        cerr << "Error: Could not open file " << argv[1] << endl;
        return 1;
    }

    vector<string> lines;
    string line;
    while (getline(file, line)) {
        lines.push_back(line);
    }
    file.close();
    
    runNexus(lines);

    return 0;
}