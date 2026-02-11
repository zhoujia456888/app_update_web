<template>
  <div class="flex flex-col py-3.5 ma h-full min-h-0">

    <div class="flex items-center justify-between px-4">
      <div class="font-semibold">App渠道管理</div>
    </div>

    <div v-if="appChannelList.length === 0" class="flex items-center justify-center py-20">
      <UEmpty
          class="flex items-center justify-between"
          icon="i-lucide-file"
          title="暂无App渠道数据"
          description="暂无App渠道数据。点击按钮创建一个新渠道吧！"
          :actions="[
      {
        icon: 'i-lucide-plus',
        label: '创建渠道',
        onClick:()=>showAddAppChannelModal()
      },
      {
        icon: 'i-lucide-refresh-cw',
        label: '刷新看看',
        color: 'neutral',
        variant: 'subtle',
        onClick: ()=>getAppChannelList(),
      }
    ]"
      />
    </div>
    <div v-else class="flex flex-col flex-1 px-4  min-h-0">
      <div class="py-3.5 border-b border-accented">
        <div class="flex items-center justify-end gap-4">
          <UInput v-model="globalFilter" placeholder="搜索渠道名称..."/>
          <UButton icon="i-lucide-plus"
                   color="primary"
                   variant="solid"
                   label="添加渠道"
                   @click="showAddAppChannelModal()"
          />

        </div>
      </div>
      <div class="flex-1 flex flex-col min-h-0">
        <!-- UTable 部分 -->
          <UTable sticky
                  v-model:page-index="pageIndex"
                  v-model:page-size="pageSize"
                  v-model:global-filter="globalFilter"
                  :data="appChannelList"
                  :columns="columns"
                  :pagination-options="{getPaginationRowModel: getPaginationRowModel()}"
                  class="flex-1 overflow-auto">
            <template #name-cell="{ row }">
              <div>
                <p class="w-1.5">
                  {{ row.original.channel_id }}
                </p>
                <p>
                  {{ row.original.channel_name }}
                </p>
                <p>
                  {{ row.original.create_time }}
                </p>
              </div>
            </template>
            <template #action-cell="{ row }">
              <div class="flex gap-2">
                <UButton
                    icon="i-lucide-edit"
                    color="neutral"
                    variant="ghost"
                    aria-label="Actions"
                    @click="showEditAppChannelModal(row.original)"
                />
                <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="ghost"
                    aria-label="Actions"
                    @click="showDeleteAppChannelModal(row.original)"
                />
              </div>
            </template>
          </UTable>

        <div class="flex justify-end border-t border-default pt-4 px-4">
          <UPagination
              :page="pageIndex + 1"
              :items-per-page="pageSize"
              :total="totalChannelCount"
              @update:page="(p) =>{
               pageIndex = p - 1
                 getAppChannelList()
            }"
          />
        </div>
      </div>
    </div>
  </div>

  <UModal v-model:open="showInputAppChannelNameModal" :title="isAddChannelModal ? '添加App渠道' : '更新App渠道'"
          :description="isAddChannelModal ? '输入渠道名称添加App渠道' : '输入渠道名称更新App渠道'"
          :ui="{ footer: 'justify-end' }">

    <template #body>
      <UInput class="w-full" v-model="channelName" label="渠道名称" placeholder="请输入渠道名称"/>
    </template>

    <template #footer="{ close }">
      <UButton :label="isAddChannelModal ? '添加渠道' : '更新渠道'" color="primary" variant="subtle"
               @click="isAddChannelModal ? createAppChannel() : updateAppChannel()"/>
      <UButton label="取消" color="neutral" variant="subtle" @click="close"/>
    </template>
  </UModal>


  <UModal v-model:open="isShowDeleteAppChannelModal" title="删除App渠道"
          :description="`确认删除App渠道'${deleteAppChannelObj?.channel_name || ''}'吗？`"
          :ui="{ footer: 'justify-end' }">

    <template #footer="{ close }">
      <UButton label="删除" color="error" variant="subtle"
               @click="deleteAppChannel()"/>
      <UButton label="取消" color="neutral" variant="subtle" @click="close"/>
    </template>
  </UModal>


</template>

<script setup lang="ts">
import {app_channel_api} from "~/api/app_channel_api";
import type {GetAppChannelListResp, GetAppChannelListRespItem} from "~/types/app_channel";
import type {TableColumn} from '@nuxt/ui'
import {getPaginationRowModel} from '@tanstack/vue-table'
import toast from "~/composables/toast";

const showInputAppChannelNameModal = ref(false)
const isAddChannelModal = ref(true)
const updateAppChannelObj = ref<GetAppChannelListRespItem>()
const channelName = ref('')
const api = app_channel_api()
const appChannelList = ref<GetAppChannelListRespItem[]>([])
const globalFilter = ref('')

const isShowDeleteAppChannelModal = ref(false)
const deleteAppChannelObj = ref<GetAppChannelListRespItem>()
const totalChannelCount = ref(0)
const pageTotal = ref(0)

const pageIndex = ref(0)
const pageSize = ref(5)

onMounted(getAppChannelList)

const columns: TableColumn<GetAppChannelListRespItem>[] = [
  {
    accessorKey: 'channel_id',
    header: '渠道Id',
    cell: ({row}) => `${row.getValue('channel_id')}`,
    meta: {
      class: {
        td: 'w-100'
      }
    }
  },
  {
    accessorKey: 'channel_name',
    header: '渠道名称',
    cell: ({row}) => `${row.getValue('channel_name')}`
  }, {
    accessorKey: 'create_time',
    header: '创建时间',
    cell: ({row}) => {
      return new Date(row.getValue('create_time')).toLocaleString('zh-CN').replaceAll('/', '-')
    }
  }, {
    accessorKey: 'update_time',
    header: '更新时间',
    cell: ({row}) => {
      return new Date(row.getValue('update_time')).toLocaleString('zh-CN').replaceAll('/', '-')
    }
  }, {
    accessorKey: 'action',
    header: '操作',
    id: 'action',
  }]

/** 获取当前账户下的所有渠道 */
async function getAppChannelList() {
  const res = await api.get_app_channel_list_by_page({
    page_index: pageIndex.value,
    page_size: pageSize.value,
  })
  if (res.data.code !== 200) {
    toast.error('获取渠道列表失败', res.data.msg || '获取渠道列表失败')
    return;
  }
  console.log(res.data.data)

  let resp: GetAppChannelListResp = res.data.data as GetAppChannelListResp
  console.log(resp)
  pageTotal.value = resp.total_page_count || 0
  console.log(pageTotal)
  totalChannelCount.value = resp.total_channel_count || 0
  appChannelList.value = resp.channel_list || []
  if (appChannelList.value.length === 0) {
    toast.info('暂无渠道数据', '暂无渠道数据')
  }

}

async function showAddAppChannelModal() {
  channelName.value = ''
  showInputAppChannelNameModal.value = true
  isAddChannelModal.value = true
}

async function createAppChannel() {
  if (!channelName.value.trim()) {
    toast.error('创建渠道失败', '渠道名称不能为空')
    return;
  }

  try {
    const res = await api.create_app_channel({
      channel_name: channelName.value,
    })
    if (res.data.code !== 200) {
      toast.error('创建渠道失败', res.data.msg || '创建渠道失败')
      return;
    }
    toast.success('创建渠道成功', res.data.data.channel_name || '创建渠道成功')
    await getAppChannelList()
    showInputAppChannelNameModal.value = false
    channelName.value = ''
  } catch (e: any) {
    // 处理异常
    let errorMessage = '创建渠道失败'
    if (e?.response?.data?.msg) {
      errorMessage = e.response.data.msg
    }
    toast.error('创建渠道失败', errorMessage || '创建渠道失败')
    return;
  }

}

async function showEditAppChannelModal(appChannel: GetAppChannelListRespItem) {
  isAddChannelModal.value = false
  channelName.value = appChannel.channel_name
  showInputAppChannelNameModal.value = true
  updateAppChannelObj.value = appChannel
}


async function updateAppChannel() {
  if (!channelName.value.trim()) {
    toast.error('更新渠道失败', '渠道名称不能为空')
    return;
  }
  try {
    const res = await api.update_app_channel({
      channel_id: updateAppChannelObj.value?.channel_id || '',
      channel_name: channelName.value,
    })
    if (res.data.code !== 200) {
      toast.error('更新渠道失败', res.data.msg || '更新渠道失败')
      return;
    }
    toast.success('更新渠道成功', res.data.data.channel_name || '更新渠道成功')
    await getAppChannelList()
    showInputAppChannelNameModal.value = false
    channelName.value = ''
    updateAppChannelObj.value = undefined
  } catch (e: any) {
    console.log(e)
    let errorMessage = '更新渠道失败'
    if (e?.response?.data?.msg) {
      errorMessage = e.response.data.msg
    }
    toast.error('更新渠道失败', errorMessage || '更新渠道失败')
  }
}

async function showDeleteAppChannelModal(appChannel: GetAppChannelListRespItem) {
  isShowDeleteAppChannelModal.value = true
  deleteAppChannelObj.value = appChannel
}

async function deleteAppChannel() {
  if (!deleteAppChannelObj.value?.channel_id) {
    toast.error('删除渠道失败', '渠道Id不能为空')
    return;
  }

  try {
    const res = await api.delete_app_channel({
      channel_id: deleteAppChannelObj.value.channel_id,
      channel_name: deleteAppChannelObj.value.channel_name || '',
    })
    if (res.data.code !== 200) {
      toast.error('删除渠道失败', res.data.msg || '删除渠道失败')
      return;
    }
    toast.success('删除渠道成功', res.data.data.channel_name || '删除渠道成功')
    await getAppChannelList()
    isShowDeleteAppChannelModal.value = false
    deleteAppChannelObj.value = undefined
  } catch (e: any) {
    let errorMessage = '删除渠道失败'
    if (e?.response?.data?.msg) {
      errorMessage = e.response.data.msg
    }
    toast.error('删除渠道失败', errorMessage || '删除渠道失败')
    return;
  }
}


</script>

<style scoped>

</style>