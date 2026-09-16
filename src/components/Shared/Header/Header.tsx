"use client";

import { ECOSYSTEM, FLAGS, languages } from "@/services/consts/header";
import { stripLocale } from "@/utils/stripLocale";
import {
  Anchor,
  Brand,
  GeneralBar,
  Header as HeaderADS,
  HeaderElement,
  HeaderProps,
  Icon,
  Institutional,
  Language,
  Languages,
  Logo,
} from "@ama-pt/agora-design-system";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

const LOGO =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU0IiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMjU0IDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHBhdGggZD0iTTEzNC4xMjYgMzEuNTIxMUgxMTcuODUxVjI2LjczMkwxMjEuNTUgMjUuMjUxN1Y2LjY2MTIyTDExNy44NTEgNS4yMjQ0OVYwLjQzNTM3NEgxMzQuMTI2VjUuMjI0NDlMMTMwLjQ3MSA2LjY2MTIyVjI1LjI1MTdMMTM0LjEyNiAyNi43MzJWMzEuNTIxMVoiIGZpbGw9IiM5Q0E2QjgiLz4NCjxwYXRoIGQ9Ik0xNDguOTg0IDAuNDM1Mzc0QzE1Mi42NjggMC40MzUzNzQgMTU1LjQ1MyAxLjI5MTYxIDE1Ny4zMzkgMy4wMDQwOEMxNTkuMjU0IDQuNzE2NTUgMTYwLjIxMSA3LjE1NDY1IDE2MC4yMTEgMTAuMzE4NEMxNjAuMjExIDExLjc0MDYgMTYwLjAyMyAxMy4xMDQ4IDE1OS42NDYgMTQuNDEwOUMxNTkuMjY4IDE1LjY4OCAxNTguNjU5IDE2Ljg0OSAxNTcuODE4IDE3Ljg5MzlDMTU2Ljk3NyAxOC45MDk3IDE1NS44NiAxOS43MjI0IDE1NC40NjcgMjAuMzMyQzE1My4wNzUgMjAuOTEyNSAxNTEuMzQ4IDIxLjIwMjcgMTQ5LjI4OSAyMS4yMDI3SDE0Ny4zM1YzMS41MjExSDEzOC40NTNWMC40MzUzNzRIMTQ4Ljk4NFpNMTQ4Ljk0MSA3LjIyNzIxSDE0Ny4zM1YxNC4zNjczSDE0OC41OTJDMTQ5LjAyOCAxNC4zNjczIDE0OS40NjMgMTQuMjUxMiAxNDkuODk4IDE0LjAxOUMxNTAuMzMzIDEzLjc1NzggMTUwLjY5NiAxMy4zNTE1IDE1MC45ODYgMTIuOEMxNTEuMjc2IDEyLjIxOTUgMTUxLjQyMSAxMS40NjQ5IDE1MS40MjEgMTAuNTM2MUMxNTEuNDIxIDkuNTQ5MjEgMTUxLjIxOCA4Ljc1MTAyIDE1MC44MTIgOC4xNDE1QzE1MC40MDYgNy41MzE5NyAxNDkuNzgyIDcuMjI3MjEgMTQ4Ljk0MSA3LjIyNzIxWiIgZmlsbD0iIzlDQTZCOCIvPg0KPHBhdGggZD0iTTE4NC41MjMgMjIuMDczNUMxODQuNTIzIDIzLjc1NjkgMTg0LjEzMSAyNS4zNTMzIDE4My4zNDggMjYuODYyNkMxODIuNTk0IDI4LjM3MTkgMTgxLjM0NiAyOS42MDU0IDE3OS42MDYgMzAuNTYzM0MxNzcuODY1IDMxLjQ5MjEgMTc1LjU1OSAzMS45NTY1IDE3Mi42ODYgMzEuOTU2NUMxNzEuMTc4IDMxLjk1NjUgMTY5LjkwMSAzMS44ODM5IDE2OC44NTcgMzEuNzM4OEMxNjcuODQyIDMxLjYyMjcgMTY2LjkxMyAzMS40MTk1IDE2Ni4wNzIgMzEuMTI5MkMxNjUuMjMxIDMwLjgzOSAxNjQuMzAyIDMwLjQ2MTcgMTYzLjI4NyAyOS45OTczVjIyLjUwODhDMTY0Ljk3IDIzLjM1MDYgMTY2LjY1MiAyNC4wMDM2IDE2OC4zMzUgMjQuNDY4QzE3MC4wMTcgMjQuOTAzNCAxNzEuNDY4IDI1LjEyMTEgMTcyLjY4NiAyNS4xMjExQzE3My4zMjUgMjUuMTIxMSAxNzMuODYxIDI1LjAxOTUgMTc0LjI5NyAyNC44MTYzQzE3NC43MzIgMjQuNjEzMSAxNzUuMDUxIDI0LjMzNzQgMTc1LjI1NCAyMy45ODkxQzE3NS40ODYgMjMuNjQwOCAxNzUuNjAyIDIzLjI0OSAxNzUuNjAyIDIyLjgxMzZDMTc1LjYwMiAyMi4yNjIxIDE3NS40NzEgMjEuNzk3NyAxNzUuMjEgMjEuNDIwNEMxNzQuOTQ5IDIxLjA0MzEgMTc0LjQ1NiAyMC42NTEyIDE3My43MzEgMjAuMjQ0OUMxNzMuMDA2IDE5LjgzODUgMTcxLjk0NyAxOS4zNDUxIDE3MC41NTQgMTguNzY0NkMxNjkuMjQ5IDE4LjIxMzIgMTY4LjEzMiAxNy42NDcyIDE2Ny4yMDMgMTcuMDY2N0MxNjYuMzA0IDE2LjQ4NjIgMTY1LjU3OSAxNS44MzMxIDE2NS4wMjggMTUuMTA3NUMxNjQuNDc2IDE0LjM4MTkgMTY0LjA3IDEzLjU0MDEgMTYzLjgwOSAxMi41ODIzQzE2My41NDggMTEuNTk1NSAxNjMuNDE3IDEwLjQzNDUgMTYzLjQxNyA5LjA5OTMyQzE2My40MTcgNy4wOTY2IDE2My45MTEgNS40Mjc2NiAxNjQuODk3IDQuMDkyNTJDMTY1LjkxMiAyLjcyODM0IDE2Ny4yOSAxLjcxMjQ3IDE2OS4wMzEgMS4wNDQ5QzE3MC43NzIgMC4zNDgyOTkgMTcyLjc3MyAwIDE3NS4wMzYgMEMxNzcuMTgzIDAgMTc5LjA1NCAwLjIzMjIgMTgwLjY1IDAuNjk2NkMxODIuMjc1IDEuMTMxOTcgMTgzLjU5NSAxLjYzOTkxIDE4NC42MSAyLjIyMDQxTDE4MS45NTUgOC43MDc0OEMxODAuNzk1IDguMDk3OTYgMTc5LjU2MiA3LjYxOTA1IDE3OC4yNTcgNy4yNzA3NUMxNzYuOTUxIDYuODkzNDIgMTc1Ljc5MSA2LjcwNDc2IDE3NC43NzUgNi43MDQ3NkMxNzQuMTY2IDYuNzA0NzYgMTczLjY3MyA2Ljc5MTg0IDE3My4yOTYgNi45NjU5OUMxNzIuOTE5IDcuMTQwMTQgMTcyLjY0MyA3LjM4Njg1IDE3Mi40NjkgNy43MDYxMkMxNzIuMjk1IDcuOTk2MzcgMTcyLjIwOCA4LjMzMDE2IDE3Mi4yMDggOC43MDc0OEMxNzIuMjA4IDkuMjAwOTEgMTcyLjM2NyA5LjYzNjI4IDE3Mi42ODYgMTAuMDEzNkMxNzMuMDM1IDEwLjM5MDkgMTczLjYyOSAxMC44MTE4IDE3NC40NzEgMTEuMjc2MkMxNzUuMzQxIDExLjcxMTYgMTc2LjU0NSAxMi4zMDY2IDE3OC4wODIgMTMuMDYxMkMxNzkuNDc1IDEzLjY5OTggMTgwLjY1IDE0LjQxMDkgMTgxLjYwNyAxNS4xOTQ2QzE4Mi41NjUgMTUuOTc4MiAxODMuMjkgMTYuOTIxNSAxODMuNzgzIDE4LjAyNDVDMTg0LjI3NiAxOS4wOTg0IDE4NC41MjMgMjAuNDQ4MSAxODQuNTIzIDIyLjA3MzVaIiBmaWxsPSIjOUNBNkI4Ii8+DQo8cGF0aCBkPSJNMjE0LjAxMiAxOS4xNTY1QzIxNC4wMTIgMjEuNzY4NyAyMTMuNTM0IDI0LjAzMjcgMjEyLjU3NiAyNS45NDgzQzIxMS42MTkgMjcuODYzOSAyMTAuMTgzIDI5LjM0NDIgMjA4LjI2OCAzMC4zODkxQzIwNi4zODIgMzEuNDM0IDIwNC4wMDQgMzEuOTU2NSAyMDEuMTMxIDMxLjk1NjVDMTk3LjAxMiAzMS45NTY1IDE5My44NjQgMzAuODY4IDE5MS42ODggMjguNjkxMkMxODkuNTEzIDI2LjQ4NTMgMTg4LjQyNSAyMy4zNjUxIDE4OC40MjUgMTkuMzMwNlYwLjQzNTM3NEgxOTcuMzQ2VjE4LjY3NzVDMTk3LjM0NiAyMC44ODM0IDE5Ny42NzkgMjIuNDc5OCAxOTguMzQ2IDIzLjQ2NjdDMTk5LjAxNCAyNC40NTM1IDE5OS45NzEgMjQuOTQ2OSAyMDEuMjE5IDI0Ljk0NjlDMjAyLjE0NyAyNC45NDY5IDIwMi45MDEgMjQuNzI5MiAyMDMuNDgxIDI0LjI5MzlDMjA0LjA2MiAyMy44NTg1IDIwNC40ODIgMjMuMTc2NCAyMDQuNzQzIDIyLjI0NzZDMjA1LjAwNCAyMS4zMTg4IDIwNS4xMzUgMjAuMTE0MyAyMDUuMTM1IDE4LjYzNFYwLjQzNTM3NEgyMTQuMDEyVjE5LjE1NjVaIiBmaWxsPSIjOUNBNkI4Ii8+DQo8cGF0aCBkPSJNMjMyLjc2NCAzMS41MjExTDIyNy4xNSA4LjcwNzQ4SDIyNi45NzZDMjI3LjAzNCA5LjI4Nzk4IDIyNy4wOTIgMTAuMDcxNyAyMjcuMTUgMTEuMDU4NUMyMjcuMjA4IDEyLjA0NTQgMjI3LjI2NyAxMy4xMTkzIDIyNy4zMjUgMTQuMjgwM0MyMjcuMzgzIDE1LjQxMjIgMjI3LjQxMiAxNi41MTUyIDIyNy40MTIgMTcuNTg5MVYzMS41MjExSDIxOS41NzlWMC40MzUzNzRIMjMyLjMyOUwyMzYuODk4IDE5LjU5MThIMjM3LjAyOUwyNDEuMjUgMC40MzUzNzRIMjU0VjMxLjUyMTFIMjQ1LjkwNlYxNy40NTg1QzI0NS45MDYgMTYuNDcxNyAyNDUuOTIgMTUuNDI2OCAyNDUuOTQ5IDE0LjMyMzhDMjQ1Ljk3OSAxMy4xOTE4IDI0Ni4wMDcgMTIuMTMyNCAyNDYuMDM2IDExLjE0NTZDMjQ2LjA5NSAxMC4xMjk3IDI0Ni4xNTMgOS4zMzE1MiAyNDYuMjExIDguNzUxMDJIMjQ2LjAzNkwyNDAuODU4IDMxLjUyMTFIMjMyLjc2NFoiIGZpbGw9IiM5Q0E2QjgiLz4NCjxwYXRoIGQ9Ik0wIDMxLjU2NDZWMC40Nzg5MTFIOC44NzczMlYyNC43NzI4SDE5Ljc1NjRWMzEuNTY0NkgwWiIgZmlsbD0iIzlDQTZCOCIvPg0KPHBhdGggZD0iTTUxLjEzNjQgMTUuOTc4MkM1MS4xMzY0IDE4LjM4NzMgNTAuODYwOCAyMC41Nzg3IDUwLjMwOTUgMjIuNTUyNEM0OS43ODc0IDI0LjQ5NyA0OC45NDYgMjYuMTgwNSA0Ny43ODU2IDI3LjYwMjdDNDYuNjU0MiAyOS4wMjQ5IDQ1LjE3NDYgMzAuMTEzNCA0My4zNDY5IDMwLjg2OEM0MS41NDgzIDMxLjYyMjcgMzkuMzU4IDMyIDM2Ljc3NiAzMkMzNC4yNTIgMzIgMzIuMDkwNyAzMS42MjI3IDMwLjI5MjEgMzAuODY4QzI4LjQ5MzQgMzAuMTEzNCAyNy4wMTM4IDI5LjAyNDkgMjUuODUzNCAyNy42MDI3QzI0LjY5MyAyNi4xODA1IDIzLjgyMjcgMjQuNDk3IDIzLjI0MjQgMjIuNTUyNEMyMi42OTEyIDIwLjU3ODcgMjIuNDE1NiAxOC4zNzI4IDIyLjQxNTYgMTUuOTM0N0MyMi40MTU2IDEyLjcxMjkgMjIuOTIzMyA5LjkxMjAyIDIzLjkzODcgNy41MzE5N0MyNC45NTQxIDUuMTIyOSAyNi41MjA3IDMuMjY1MzEgMjguNjM4NSAxLjk1OTE4QzMwLjc1NjIgMC42NTMwNjEgMzMuNDgzMyAwIDM2LjgxOTUgMEM0MC4yNDI4IDAgNDIuOTk4OCAwLjY2NzU3NCA0NS4wODc2IDIuMDAyNzJDNDcuMjA1NCAzLjMwODg0IDQ4Ljc0MyA1LjE2NjQ0IDQ5LjcwMDMgNy41NzU1MUM1MC42NTc3IDkuOTU1NTUgNTEuMTM2NCAxMi43NTY1IDUxLjEzNjQgMTUuOTc4MlpNMzEuNzI4MSAxNS45NzgyQzMxLjcyODEgMTcuODM1OCAzMS44ODc3IDE5LjQ0NjcgMzIuMjA2OCAyMC44MTA5QzMyLjU1NDkgMjIuMTQ2IDMzLjEwNjEgMjMuMTc2NCAzMy44NjA0IDIzLjkwMkMzNC42MTQ3IDI0LjYyNzcgMzUuNTg2NSAyNC45OTA1IDM2Ljc3NiAyNC45OTA1QzM4LjA1MjUgMjQuOTkwNSAzOS4wNTMzIDI0LjYyNzcgMzkuNzc4NiAyMy45MDJDNDAuNTAzOSAyMy4xNzY0IDQxLjAyNjEgMjIuMTQ2IDQxLjM0NTIgMjAuODEwOUM0MS42NjQzIDE5LjQ0NjcgNDEuODIzOSAxNy44MzU4IDQxLjgyMzkgMTUuOTc4MkM0MS44MjM5IDEzLjE2MjggNDEuNDQ2NyAxMC45NDI0IDQwLjY5MjUgOS4zMTcwMUMzOS45NjcyIDcuNjkxNjEgMzguNjc2MiA2Ljg3ODkxIDM2LjgxOTUgNi44Nzg5MUMzNS41NzIgNi44Nzg5MSAzNC41NzEyIDcuMjU2MjQgMzMuODE2OSA4LjAxMDg4QzMzLjA2MjYgOC43MzY1MSAzMi41MjU5IDkuNzgxNCAzMi4yMDY4IDExLjE0NTZDMzEuODg3NyAxMi40ODA3IDMxLjcyODEgMTQuMDkxNiAzMS43MjgxIDE1Ljk3ODJaIiBmaWxsPSIjOUNBNkI4Ii8+DQo8cGF0aCBkPSJNNjguMTA3NyAxMy4zNjZIODEuMjQ5NlYzMC4xMjc5Qzc5Ljc0MSAzMC42Nzk0IDc3LjkyNzkgMzEuMTI5MiA3NS44MTAxIDMxLjQ3NzZDNzMuNzIxMyAzMS44MjU4IDcxLjYwMzUgMzIgNjkuNDU2NyAzMkM2Ni43MDA3IDMyIDY0LjIzNDcgMzEuNDE5NSA2Mi4wNTg5IDMwLjI1ODVDNTkuODgzMSAyOS4wOTc1IDU4LjE3MTUgMjcuMzI3IDU2LjkyNCAyNC45NDY5QzU1LjY3NjYgMjIuNTY2OSA1NS4wNTI4IDE5LjU2MjggNTUuMDUyOCAxNS45MzQ3QzU1LjA1MjggMTIuNjgzOSA1NS42MzMgOS44Njg0OCA1Ni43OTM1IDcuNDg4NDNDNTcuOTUzOSA1LjEwODM5IDU5LjY4IDMuMjc5ODIgNjEuOTcxOSAyLjAwMjcyQzY0LjI2MzggMC42OTY1OTggNjcuMDkyMyAwLjA0MzUzNjggNzAuNDU3NiAwLjA0MzUzNjhDNzIuNDMwMyAwLjA0MzUzNjggNzQuMjcyNSAwLjIzMjE5OSA3NS45ODQxIDAuNjA5NTI0Qzc3LjY5NTggMC45NTc4MjIgNzkuMTQ2MyAxLjQyMjIyIDgwLjMzNTggMi4wMDI3Mkw3Ny41OTQyIDguNTc2ODdDNzYuNDYyOCA4LjAyNTQgNzUuMzMxNCA3LjYxOTA1IDc0LjIgNy4zNTc4MkM3My4wNjg2IDcuMDY3NTcgNzEuODUwMSA2LjkyMjQ1IDcwLjU0NDYgNi45MjI0NUM2OC44MzMgNi45MjI0NSA2Ny41MTMgNy4zNDMzMSA2Ni41ODQ2IDguMTg1MDNDNjUuNjU2MyA5LjAyNjc2IDY1LjAxOCAxMC4xNDQyIDY0LjY2OTkgMTEuNTM3NEM2NC4zNTA4IDEyLjkzMDYgNjQuMTkxMiAxNC40Njg5IDY0LjE5MTIgMTYuMTUyNEM2NC4xOTEyIDE4LjA2OCA2NC40Mzc4IDE5LjY5MzQgNjQuOTMxIDIxLjAyODZDNjUuNDUzMiAyMi4zNjM3IDY2LjE2NCAyMy4zNzk2IDY3LjA2MzMgMjQuMDc2MkM2Ny45OTE3IDI0Ljc0MzggNjkuMDUwNSAyNS4wNzc1IDcwLjI0IDI1LjA3NzVDNzAuNDE0MSAyNS4wNzc1IDcwLjY4OTcgMjUuMDYzIDcxLjA2NjggMjUuMDM0QzcxLjQ3MjkgMjUuMDA1IDcxLjg2NDYgMjQuOTYxNSA3Mi4yNDE3IDI0LjkwMzRDNzIuNjQ3OSAyNC44NDU0IDcyLjkzOCAyNC43ODczIDczLjExMjEgMjQuNzI5MlYxOS44NTMxSDY4LjEwNzdWMTMuMzY2WiIgZmlsbD0iIzlDQTZCOCIvPg0KPHBhdGggZD0iTTExNC40MTMgMTUuOTc4MkMxMTQuNDEzIDE4LjM4NzMgMTE0LjEzOCAyMC41Nzg3IDExMy41ODcgMjIuNTUyNEMxMTMuMDY0IDI0LjQ5NyAxMTIuMjIzIDI2LjE4MDUgMTExLjA2MyAyNy42MDI3QzEwOS45MzEgMjkuMDI0OSAxMDguNDUyIDMwLjExMzQgMTA2LjYyNCAzMC44NjhDMTA0LjgyNSAzMS42MjI3IDEwMi42MzUgMzIgMTAwLjA1MyAzMkM5Ny41MjkxIDMyIDk1LjM2NzggMzEuNjIyNyA5My41NjkxIDMwLjg2OEM5MS43NzA1IDMwLjExMzQgOTAuMjkwOSAyOS4wMjQ5IDg5LjEzMDUgMjcuNjAyN0M4Ny45NyAyNi4xODA1IDg3LjA5OTcgMjQuNDk3IDg2LjUxOTUgMjIuNTUyNEM4NS45NjgzIDIwLjU3ODcgODUuNjkyNyAxOC4zNzI4IDg1LjY5MjcgMTUuOTM0N0M4NS42OTI3IDEyLjcxMjkgODYuMjAwNCA5LjkxMjAyIDg3LjIxNTggNy41MzE5N0M4OC4yMzExIDUuMTIyOSA4OS43OTc3IDMuMjY1MzEgOTEuOTE1NSAxLjk1OTE4Qzk0LjAzMzMgMC42NTMwNjEgOTYuNzYwMyAwIDEwMC4wOTcgMEMxMDMuNTIgMCAxMDYuMjc2IDAuNjY3NTc0IDEwOC4zNjUgMi4wMDI3MkMxMTAuNDgyIDMuMzA4ODQgMTEyLjAyIDUuMTY2NDQgMTEyLjk3NyA3LjU3NTUxQzExMy45MzUgOS45NTU1NSAxMTQuNDEzIDEyLjc1NjUgMTE0LjQxMyAxNS45NzgyWk05NS4wMDUyIDE1Ljk3ODJDOTUuMDA1MiAxNy44MzU4IDk1LjE2NDcgMTkuNDQ2NyA5NS40ODM4IDIwLjgxMDlDOTUuODMyIDIyLjE0NiA5Ni4zODMyIDIzLjE3NjQgOTcuMTM3NSAyMy45MDJDOTcuODkxNyAyNC42Mjc3IDk4Ljg2MzYgMjQuOTkwNSAxMDAuMDUzIDI0Ljk5MDVDMTAxLjMzIDI0Ljk5MDUgMTAyLjMzIDI0LjYyNzcgMTAzLjA1NiAyMy45MDJDMTAzLjc4MSAyMy4xNzY0IDEwNC4zMDMgMjIuMTQ2IDEwNC42MjIgMjAuODEwOUMxMDQuOTQxIDE5LjQ0NjcgMTA1LjEwMSAxNy44MzU4IDEwNS4xMDEgMTUuOTc4MkMxMDUuMTAxIDEzLjE2MjggMTA0LjcyNCAxMC45NDI0IDEwMy45NyA5LjMxNzAxQzEwMy4yNDQgNy42OTE2MSAxMDEuOTUzIDYuODc4OTEgMTAwLjA5NyA2Ljg3ODkxQzk4Ljg0OTEgNi44Nzg5MSA5Ny44NDgyIDcuMjU2MjQgOTcuMDkzOSA4LjAxMDg4Qzk2LjMzOTcgOC43MzY1MSA5NS44MDMgOS43ODE0IDk1LjQ4MzggMTEuMTQ1NkM5NS4xNjQ3IDEyLjQ4MDcgOTUuMDA1MiAxNC4wOTE2IDk1LjAwNTIgMTUuOTc4MloiIGZpbGw9IiM5Q0E2QjgiLz4NCjwvc3ZnPg0K";

export default function Header(args: HeaderProps) {
  const { t, i18n } = useTranslation("common");
  const routerNav = useRouter();
  const pathname = usePathname();
  const noLocalePath = stripLocale(pathname);

  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [ecosystemBtnPortalNode, setEcosystemBtnPortalNode] =
    useState<HTMLLIElement | null>(null);
  const [ecosystemPanelNode, setEcosystemPanelNode] =
    useState<HTMLDivElement | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setEcosystemOpen(false);
  }

  const headerRef = useRef<HeaderElement>(null);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    routerNav.push(`/${lang}/${noLocalePath}`);
  };

  useLayoutEffect(() => {
    const panelsList = document.querySelector(
      "header .panels-menu > ul",
    );
    if (!panelsList) return;

    let li = panelsList.querySelector(
      ".ecosystem-custom-menu",
    ) as HTMLLIElement | null;
    if (!li) {
      li = document.createElement("li");
      li.className = "ecosystem-custom-menu";
      li.style.display = "flex";
      li.style.alignItems = "stretch";
      const authLi = panelsList.lastElementChild;
      if (authLi) {
        panelsList.insertBefore(li, authLi);
      } else {
        panelsList.appendChild(li);
      }
    }

    let panelDiv = document.querySelector(
      ".ecosystem-panel-container",
    ) as HTMLDivElement | null;
    if (!panelDiv) {
      panelDiv = document.createElement("div");
      panelDiv.className = "ecosystem-panel-container";
      document.body.appendChild(panelDiv);
    }

    queueMicrotask(() => {
      setEcosystemBtnPortalNode(li);
      setEcosystemPanelNode(panelDiv);
    });

    return () => {
      panelsList.querySelector(".ecosystem-custom-menu")?.remove();
      document.querySelector(".ecosystem-panel-container")?.remove();
      setEcosystemBtnPortalNode(null);
      setEcosystemPanelNode(null);
    };
  }, []);

  // Keep the ecosystem <li> immediately after the language selector
  useLayoutEffect(() => {
    const panelsList = document.querySelector(
      "header .panels-menu > ul",
    );
    if (!panelsList) return;
    const ecosystemLi = panelsList.querySelector(".ecosystem-custom-menu");
    const lastChild = panelsList.lastElementChild;
    if (ecosystemLi && lastChild && lastChild !== ecosystemLi) {
      panelsList.append(lastChild, ecosystemLi);
    }
  }, []);

  useEffect(() => {
    headerRef.current?.closeAll?.();
  }, [pathname]);

  // Position ecosystem panel right below the panels-menu bar (covering the nav bar)
  useEffect(() => {
    if (!ecosystemOpen) return;
    const panelDiv = document.querySelector(
      ".ecosystem-panel-container",
    ) as HTMLDivElement | null;
    if (!panelDiv) return;
    const panelsMenu = document.querySelector("header .panels-menu");
    if (panelsMenu) {
      const rect = panelsMenu.getBoundingClientRect();
      panelDiv.style.top = `${rect.bottom}px`;
      panelDiv.style.maxHeight = `${window.innerHeight - rect.bottom}px`;
      panelDiv.style.overflowY = "auto";
    }
  }, [ecosystemOpen, ecosystemPanelNode]);

  return (
    <header className="[&_.custom-search-layout]:m-0! [&_.custom-search-layout]:mx-auto!">
      <HeaderADS {...args} ref={headerRef}>
        <Brand>
          <Logo>
            <a
              target="_blank"
              href="/"
              rel="noreferrer"
              className="w-full h-full"
            >
              <Image
                src={LOGO}
                width={254}
                height={32}
                className="w-full h-full"
                alt={t("title")}
              />
            </a>
          </Logo>

          <Institutional>{t("title")}</Institutional>
        </Brand>

        <GeneralBar aria-label="Utilities menu">
          <Languages
            aria-label={t("header.selectLanguage")}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <Language
                key={lang.value}
                value={lang.value}
                icon={FLAGS[lang.value]}
                label={lang.label}
                abbr={lang.abbr}
                checked={selectedLanguage === lang.value}
              />
            ))}
          </Languages>
        </GeneralBar>
      </HeaderADS>

      {ecosystemBtnPortalNode &&
        createPortal(
          <>
            <span className="agora-link-wrapper agora-link-wrapper-link-neutral custom-header-link-wrapper panel-menu-link-wrapper inline-flex items-center px-8!">
              <a
                className="link-with-icon"
                href="#"
                aria-expanded={ecosystemOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setEcosystemOpen((o) => !o);
                }}
              >
                <div className="flex flex-roow gap-4 items-center">
                  <div className="icon-wrapper leading flex items-center">
                    <Icon name="agora-line-dashboard" className="h-24 w-24" />
                  </div>
                  <span className="children-wrapper hidden md:inline">
                    {t("header.ecosystem.btn")}
                  </span>
                  <Image
                    src="/logos/arte_black_simple.svg"
                    alt="ARTE"
                    width={42}
                    height={16}
                    className="ml-8 hidden h-16 w-auto self-center md:block"
                  />
                </div>
              </a>
            </span>
          </>,
          ecosystemBtnPortalNode,
        )}
      {ecosystemPanelNode &&
        ecosystemOpen &&
        createPortal(
          <div className="ecosystem-custom-panel">
            <div className="container mx-auto flex w-full flex-col py-16 md:flex-row md:py-32">
              <div className="flex flex-1 flex-col gap-16 pl-0 md:gap-32">
                <div className="flex flex-row items-start gap-32">
                  <p className="text-base font-bold text-primary-900">
                    {t("header.ecosystem.description")}
                  </p>
                </div>
                <div>
                  <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                    {ECOSYSTEM.map((item) => (
                      <li key={item.href} className="w-full max-w-full">
                        <Anchor
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          appearance="link"
                        >
                          <div className="flex items-center gap-8 py-8">
                            <div
                              className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: item.bgColor ?? undefined,
                              }}
                            >
                              <div className="relative h-20 w-20">
                                <Image
                                  src={item.icon ?? ""}
                                  alt={item.label}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                            <span className="text-base font-medium">
                              {item.label}
                            </span>
                          </div>
                        </Anchor>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>,
          ecosystemPanelNode,
        )}
    </header>
  );
}
