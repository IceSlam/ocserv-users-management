import _axios from "@/plugins/axios";
import { AxiosError, AxiosResponse } from "axios";
import {
  AdminConfig,
  AminLogin,
  Config,
  Dashboard,
  UserPagination,
  GroupPagination,
  OcservUser,
  OcservGroup,
  Occtl,
  Stats,
} from "./types";
import store from "@/plugins/store";

class Services {
  private status_code: number = 500;
  public method: string = "get";
  public baseUrl: string = "";
  public path: string = "";
  private axiosMethods: { [K: string]: Function } = {
    get: _axios.get,
    post: _axios.post,
    patch: _axios.patch,
    put: _axios.put,
    delete: _axios.delete,
  };

  public async request(data?: any): Promise<any> {
    store.commit("setLoadingOverlay", {
      active: true,
      text: "Requesting ...",
    });
    let url: string = this.baseUrl + this.path;
    return await this.axiosMethods[this.method]((url = url), (data = data))
      .then((response: AxiosResponse) => {
        if (response) {
          this.status_code = response.status;
          if (this.status_code == 400) {
            store.commit("setSnackBar", {
              text: response.data.error.join("<br/>"),
              color: "error",
            });
            return {};
          } else if (this.status_code == 401) {
            localStorage.removeItem("token");
            location.href = "/login";
          } else if (this.status_code == 403) {
            store.commit("setSnackBar", {
              text: "forbiden error",
              color: "warning",
            });
            return {};
          }
          return response.data;
        } else {
          throw new Error("Server error");
        }
      })
      .catch((error: AxiosError) => {
        this.status_code = error.response?.status!;
        if (error.response?.data) {
          let e = error.response.data;
          if (e.detail) {
            store.commit("setSnackBar", {
              text: e.detail,
              color: "orange",
            });
          }
        } else {
          store.commit("setSnackBar", {
            text: "response failed from server",
            color: "error",
          });
        }
        return Promise.reject(error);
      })
      .finally((_: null) => {
        store.commit("setLoadingOverlay", {
          active: false,
          text: null,
        });
      });
  }

  public status(): number {
    return this.status_code;
  }
}

class AdminServiceApi extends Services {
  constructor() {
    super();
    this.baseUrl = "/admin/";
    this.path = "";
  }
  public async config(): Promise<Config> {
    this.method = "get";
    this.path = "config/";
    return this.request();
  }
  public async login(
    data: AminLogin
  ): Promise<{ token: string; user: string }> {
    this.method = "post";
    this.path = "login/";
    return this.request(data);
  }
  public async logout(): Promise<void> {
    this.method = "delete";
    this.path = "logout/";
    await this.request();
  }
  public async create_configs(data: object): Promise<Config> {
    this.method = "post";
    this.path = "create/";
    return await this.request(data);
  }
  public async patch_configuration(data: object): Promise<null> {
    this.method = "patch";
    this.path = "configuration/";
    await this.request(data);
    return null;
  }
  public async get_configuration(): Promise<AdminConfig> {
    this.method = "get";
    this.path = "configuration/";
    return await this.request();
  }

  public async dashboard(): Promise<Dashboard> {
    this.method = "get";
    this.path = "dashboard/";
    return this.request();
  }
}

class OcservUserApi extends Services {
  constructor() {
    super();
    this.baseUrl = "/users/";
    this.path = "";
  }
  public async users(): Promise<UserPagination> {
    this.method = "get";
    this.path = "";
    return this.request();
  }
  public async create_user(data: OcservUser): Promise<OcservUser> {
    this.method = "post";
    this.path = "";
    return this.request((data = data));
  }
  public async update_user(pk: number, data: OcservUser): Promise<OcservUser> {
    this.method = "patch";
    this.path = `${pk}/`;
    return this.request((data = data));
  }
  public async delete_user(pk: number): Promise<OcservUser> {
    this.method = "delete";
    this.path = `${pk}/`;
    return this.request();
  }
  public async disconnect_user(pk: number): Promise<OcservUser> {
    this.method = "post";
    this.path = `${pk}/disconnect/`;
    return this.request();
  }
}

class OcservGroupApi extends Services {
  constructor() {
    super();
    this.baseUrl = "/groups/";
    this.path = "";
  }
  public async groups(args?: string | null): Promise<GroupPagination> {
    this.method = "get";
    this.path = args ? `?args=${args}` : "";
    return this.request();
  }
  public async create_group(data: OcservGroup): Promise<OcservGroup> {
    this.path = "";
    this.method = "post";
    return this.request((data = data));
  }
  public async update_group(
    pk: number,
    data: OcservGroup
  ): Promise<OcservGroup> {
    this.method = "patch";
    this.path = `${pk}/`;
    return this.request((data = data));
  }
  public async delete_group(pk: number): Promise<OcservGroup> {
    this.method = "delete";
    this.path = `${pk}/`;
    return this.request();
  }
}

class OcctlServiceApi extends Services {
  constructor() {
    super();
    this.baseUrl = "/occtl/";
    this.method = "";
    this.path = "";
  }
  public async config(config: string, args: string): Promise<Occtl> {
    this.method = "get";
    this.path = `command/${config}/?args=${args}`;
    return this.request();
  }
  public async reload(): Promise<null> {
    this.method = "get";
    this.path = "reload/";
    return this.request();
  }
}

class StatsServiceApi extends Services {
  constructor() {
    super();
    this.baseUrl = "/stats/";
    this.method = "";
    this.path = "";
  }
  public async get_stats(): Promise<Stats> {
    this.method = "get";
    this.path = "";
    return this.request();
  }
  // public async reload(): Promise<null> {
  //   this.method = "get";
  //   this.path = "reload/";
  //   return this.request();
  // }
}

const adminServiceApi = new AdminServiceApi();
const ocservUserApi = new OcservUserApi();
const ocservGroupApi = new OcservGroupApi();
const occtlServiceApi = new OcctlServiceApi();
const statsServiceApi = new StatsServiceApi();
export {
  adminServiceApi,
  ocservUserApi,
  ocservGroupApi,
  occtlServiceApi,
  statsServiceApi,
};
