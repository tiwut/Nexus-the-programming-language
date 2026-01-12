#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <fstream>
#include <regex>
#include <sstream>

using namespace std;

map<string, string> vars;
map<string, vector<string>> funcs;
vector<pair<string, string>> gui_buttons;

string trim(string s) {
    if (s.empty()) return s;
    s.erase(0, s.find_first_not_of(" \t\r\n"));
    size_t last = s.find_last_not_of(" \t\r\n");
    if (last != string::npos) s.erase(last + 1);
    return s;
}

string read_file_content(string filename) {
    ifstream f(filename);
    if (!f.is_open()) return "Empty";
    string line, content = "";
    while(getline(f, line)) content += line + " | ";
    return content.empty() ? "Empty" : content;
}

string resolve_complex(string input) {
    input = trim(input);
    
    if (input.find("io.read(") != string::npos) {
        size_t start = input.find("(") + 1;
        size_t end = input.find_last_of(")");
        string filename_var = input.substr(start, end - start);
        return read_file_content(resolve_complex(filename_var));
    }

    string result = "";
    stringstream ss(input); string part;
    while (getline(ss, part, '+')) {
        part = trim(part);
        if (part.size() >= 2 && part.front() == '"') result += part.substr(1, part.size() - 2);
        else if (vars.count(part)) result += vars[part];
        else result += part;
    }
    return result;
}

void runNexus(vector<string> lines);

void show_cpp_dashboard() {
    while (true) {
        string cmd = "zenity --list --title=\"Nexus Dashboard\" --column=\"Actions\" ";
        for (auto& btn : gui_buttons) cmd += "\"" + btn.first + "\" ";
        cmd += "\"Exit\" 2>/dev/null";
        char buf[128]; string choice = ""; FILE* p = popen(cmd.c_str(), "r");
        if (p) { while (fgets(buf, 128, p)) choice += buf; pclose(p); }
        choice = trim(choice);
        if (choice == "Exit" || choice == "") break;
        for (auto& btn : gui_buttons) if (btn.first == choice) runNexus(funcs[btn.second]);
    }
}

void runNexus(vector<string> lines) {
    for (size_t i = 0; i < lines.size(); ++i) {
        string line = trim(lines[i]);
        if (line.empty() || line[0] == '#') continue;
        smatch m;
        if (regex_search(line, m, regex(R"(set\s+(\w+)\s*=\s*(.*))"))) vars[m[1]] = resolve_complex(m[2]);
        else if (regex_search(line, m, regex(R"(out\s+(.*))"))) cout << "Nexus › " << resolve_complex(m[1]) << endl;
        else if (regex_search(line, m, regex(R"(input\s+(\w+)\s+(.*))"))) {
            string pr = resolve_complex(m[2]);
            string cmd = "zenity --entry --text=\"" + pr + "\" 2>/dev/null";
            char buf[128]; string r = ""; FILE* p = popen(cmd.c_str(), "r");
            if (p) { while (fgets(buf, 128, p)) r += buf; pclose(p); }
            vars[m[1]] = trim(r);
        }
        else if (line.find("gui.msg(") != string::npos) {
            string msg = resolve_complex(line.substr(8, line.find_last_of(")") - 8));
            system(("zenity --info --text=\"" + msg + "\" 2>/dev/null").c_str());
        }
        else if (line.find("gui.button(") != string::npos) {
            size_t f = line.find("\"") + 1; size_t s = line.find("\"", f);
            size_t t = line.find("\"", s + 1) + 1; size_t fo = line.find("\"", t);
            gui_buttons.push_back({line.substr(f, s-f), line.substr(t, fo-t)});
        }
        else if (line.find("io.write(") != string::npos) {
            size_t comma = line.find(",");
            string file = resolve_complex(line.substr(9, comma - 9));
            string data = resolve_complex(line.substr(comma + 1, line.find_last_of(")") - (comma + 1)));
            if (data == "") { ofstream out(file); out.close(); }
            else { ofstream out(file, ios::app); out << data << endl; }
        }
        else if (line.substr(0, 2) == "fn") {
            string n = trim(line.substr(3, line.find("(") - 3));
            vector<string> b; i++;
            while (i < lines.size() && trim(lines[i]) != "end") { b.push_back(lines[i]); i++; }
            funcs[n] = b;
        }
        else if (line.find("gui.run()") != string::npos) show_cpp_dashboard();
        else if (line.find("()") != string::npos) {
            string n = line.substr(0, line.find("("));
            if (funcs.count(n)) runNexus(funcs[n]);
        }
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2) return 1;
    ifstream f(argv[1]); vector<string> l; string s;
    while (getline(f, s)) l.push_back(s);
    runNexus(l); return 0;
}