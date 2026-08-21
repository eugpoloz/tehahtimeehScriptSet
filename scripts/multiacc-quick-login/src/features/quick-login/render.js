import { handleLogin } from "@teh/utils";
import { getMultiaccItemHTML, MULTIACC_LIST_VIP_HTML } from "./markup";
import { getMultiaccEncryptedData, saveMultiaccEncryptedData } from "./storage";
import { getVIPMultiAccList } from "./vip-accounts";

export const setFormBusy = () => {
  const form = document.querySelector("#teh-multiacc-quick-login section.form");
  if (form) {
    form.classList.add("busy");
  }
};

/** @returns {Promise<void>} */
export const renderMultiaccList = async () => {
  const multiaccList = document.getElementById("multiacc-list");
  const pun = document.getElementById("pun");
  const multiListLocal = document.getElementById("multiacc-list-local");
  if (!multiaccList || !pun || !multiListLocal) {
    return;
  }

  const isVIP = pun.classList.contains("isvip");

  if (isVIP) {
    if (!document.getElementById("multiacc-list-vip")) {
      multiaccList.insertAdjacentHTML("beforeend", MULTIACC_LIST_VIP_HTML);
    }

    const multiListVip = document.getElementById("multiacc-list-vip");
    if (!multiListVip) {
      return;
    }

    if (multiListVip.innerHTML === "") {
      const multiList = await getVIPMultiAccList();

      if (multiList) {
        multiList.forEach((item) => {
          multiListVip.insertAdjacentElement("beforeend", item);

          const multiVipItemLinks = item.querySelectorAll(
            "a[href*='section=multi']"
          );

          multiVipItemLinks.forEach((link) =>
            link.addEventListener("click", () => {
              setFormBusy();
            })
          );
        });
      }

      multiListVip.classList.remove("loading");
    }
  }

  if (multiListLocal.innerHTML === "") {
    let decryptedData = await getMultiaccEncryptedData();

    if (decryptedData) {
      decryptedData.forEach((item) => {
        multiListLocal.innerHTML += getMultiaccItemHTML(item.login);
      });

      const multiaccLocalItems = multiListLocal.querySelectorAll(
        ".multiacc-item[data-login]"
      );

      multiaccLocalItems.forEach((itemElement) => {
        if (!(itemElement instanceof HTMLElement)) {
          return;
        }
        const removeItem = itemElement.querySelector(".multiacc-item-remove");
        const loginItem = itemElement.querySelector(".multiacc-item-login");

        const login = itemElement.dataset.login;
        if (!removeItem || !login) {
          return;
        }

        removeItem.addEventListener("click", async (e) => {
          e.preventDefault();

          const updatedData = [...(decryptedData ?? [])].filter(
            (storedItem) => storedItem.login !== login
          );

          await saveMultiaccEncryptedData(updatedData);
          decryptedData = await getMultiaccEncryptedData();

          itemElement.remove();
        });

        if (loginItem) {
          loginItem.addEventListener("click", async (e) => {
            e.preventDefault();
            setFormBusy();

            const password = decryptedData?.find(
              (storedItem) => storedItem.login === login
            )?.password;

            await handleLogin({ login, password });
          });
        }
      });
    }

    multiListLocal.classList.remove("loading");
  }
};
